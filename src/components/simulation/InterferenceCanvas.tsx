import React, { useRef, useEffect, useState, useCallback } from 'react';
import { OpticalParameters, TravellingMicroscopeState } from '../../types/physics';
import {
  wavelengthToRGB,
  calculateFilmThickness,
  calculateMonochromaticIntensity,
  calculateWhiteLightColor,
  calculateSodiumDoubletIntensity,
  getTheoreticalRingDiameterMm,
} from '../../physics/optics';
import { Crosshair, Eye, Layers } from 'lucide-react';

interface Props {
  params: OpticalParameters;
  microscope: TravellingMicroscopeState;
  onMicroscopeMove: (newPosX: number) => void;
  onSelectRing?: (ringOrder: number) => void;
  viewMode: 'top' | 'side';
  onToggleViewMode: (mode: 'top' | 'side') => void;
}

export const InterferenceCanvas: React.FC<Props> = ({
  params,
  microscope,
  onMicroscopeMove,
  viewMode,
  onToggleViewMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Offscreen canvas cache for the heavy interference pattern
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  const [hoverInfo, setHoverInfo] = useState<{
    rMm: number;
    tNm: number;
    opdNm: number;
    nearestRing?: number;
  }>({
    rMm: 0.0,
    tNm: 0.0,
    opdNm: 0.0,
  });

  const isDraggingRef = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Canvas internal rendering resolution
  const CANVAS_SIZE = 560;
  const baseFovMm = 14.0;
  const fovMm = baseFovMm / params.magnification;
  const mmToPixels = CANVAS_SIZE / fovMm;
  const centerPx = CANVAS_SIZE / 2;
  const maxRadiusPx = centerPx - 8;

  // 1. Render and Cache the Background Interference Pattern
  // This only runs when OPTICAL parameters change (NOT on every mouse move or microscope step!)
  useEffect(() => {
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
      offscreenRef.current.width = CANVAS_SIZE;
      offscreenRef.current.height = CANVAS_SIZE;
    }

    const offscreen = offscreenRef.current;
    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = CANVAS_SIZE;
    const height = CANVAS_SIZE;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const isReflected = params.lightMode === 'reflected';
    const mu = params.mediumRefractiveIndex;
    const contrast = params.contrast;
    const intensityFactor = params.intensity;
    const baseRGB = wavelengthToRGB(params.wavelength);

    const isWhite = params.wavelengthPreset === 'white';
    const isDoublet = params.wavelengthPreset === 'sodium_doublet';
    const hasIrreg = params.hasIrregularity;
    const radiusCurv = params.radiusCurvature;
    const d0Nm = params.lensDisplacement;

    if (!hasIrreg) {
      // 1D radial LUT for fast symmetric rendering
      const radialLutSize = Math.ceil(maxRadiusPx) + 2;
      const lutR = new Uint8ClampedArray(radialLutSize);
      const lutG = new Uint8ClampedArray(radialLutSize);
      const lutB = new Uint8ClampedArray(radialLutSize);

      for (let rPx = 0; rPx < radialLutSize; rPx++) {
        const rMm = rPx / mmToPixels;
        const rMeters = rMm * 1e-3;
        const tMeters = (rMeters * rMeters) / (2 * radiusCurv) + d0Nm * 1e-9;

        if (isWhite) {
          const [cr, cg, cb] = calculateWhiteLightColor(tMeters, mu, isReflected, contrast);
          lutR[rPx] = Math.min(255, Math.round(cr * intensityFactor));
          lutG[rPx] = Math.min(255, Math.round(cg * intensityFactor));
          lutB[rPx] = Math.min(255, Math.round(cb * intensityFactor));
        } else if (isDoublet) {
          const I = calculateSodiumDoubletIntensity(tMeters, mu, isReflected, contrast) * intensityFactor;
          lutR[rPx] = Math.min(255, Math.round(baseRGB[0] * I));
          lutG[rPx] = Math.min(255, Math.round(baseRGB[1] * I));
          lutB[rPx] = Math.min(255, Math.round(baseRGB[2] * I));
        } else {
          const I = calculateMonochromaticIntensity(tMeters, params.wavelength, mu, isReflected, contrast) * intensityFactor;
          lutR[rPx] = Math.min(255, Math.round(baseRGB[0] * I));
          lutG[rPx] = Math.min(255, Math.round(baseRGB[1] * I));
          lutB[rPx] = Math.min(255, Math.round(baseRGB[2] * I));
        }
      }

      let idx = 0;
      for (let y = 0; y < height; y++) {
        const dy = y - centerPx;
        const dy2 = dy * dy;
        for (let x = 0; x < width; x++) {
          const dx = x - centerPx;
          const distPx = Math.sqrt(dx * dx + dy2);

          if (distPx <= maxRadiusPx) {
            const rFloor = Math.floor(distPx);
            const rCeil = Math.min(radialLutSize - 1, rFloor + 1);
            const frac = distPx - rFloor;

            data[idx] = lutR[rFloor] * (1 - frac) + lutR[rCeil] * frac;
            data[idx + 1] = lutG[rFloor] * (1 - frac) + lutG[rCeil] * frac;
            data[idx + 2] = lutB[rFloor] * (1 - frac) + lutB[rCeil] * frac;
            data[idx + 3] = 255;
          } else {
            data[idx] = 6;
            data[idx + 1] = 9;
            data[idx + 2] = 18;
            data[idx + 3] = 255;
          }
          idx += 4;
        }
      }
    } else {
      // 2D evaluation for optical surface defect
      let idx = 0;
      for (let y = 0; y < height; y++) {
        const dy = y - centerPx;
        const dyMm = dy / mmToPixels;
        const yMeters = dyMm * 1e-3;

        for (let x = 0; x < width; x++) {
          const dx = x - centerPx;
          const distPx = Math.sqrt(dx * dx + dy * dy);

          if (distPx <= maxRadiusPx) {
            const dxMm = dx / mmToPixels;
            const xMeters = dxMm * 1e-3;
            const rMeters = (distPx / mmToPixels) * 1e-3;
            const tMeters = calculateFilmThickness(rMeters, xMeters, yMeters, params);

            if (isWhite) {
              const [cr, cg, cb] = calculateWhiteLightColor(tMeters, mu, isReflected, contrast);
              data[idx] = Math.min(255, Math.round(cr * intensityFactor));
              data[idx + 1] = Math.min(255, Math.round(cg * intensityFactor));
              data[idx + 2] = Math.min(255, Math.round(cb * intensityFactor));
            } else if (isDoublet) {
              const I = calculateSodiumDoubletIntensity(tMeters, mu, isReflected, contrast) * intensityFactor;
              data[idx] = Math.min(255, Math.round(baseRGB[0] * I));
              data[idx + 1] = Math.min(255, Math.round(baseRGB[1] * I));
              data[idx + 2] = Math.min(255, Math.round(baseRGB[2] * I));
            } else {
              const I = calculateMonochromaticIntensity(tMeters, params.wavelength, mu, isReflected, contrast) * intensityFactor;
              data[idx] = Math.min(255, Math.round(baseRGB[0] * I));
              data[idx + 1] = Math.min(255, Math.round(baseRGB[1] * I));
              data[idx + 2] = Math.min(255, Math.round(baseRGB[2] * I));
            }
            data[idx + 3] = 255;
          } else {
            data[idx] = 6;
            data[idx + 1] = 9;
            data[idx + 2] = 18;
            data[idx + 3] = 255;
          }
          idx += 4;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Eyepiece vignette
    const grad = ctx.createRadialGradient(
      centerPx, centerPx, maxRadiusPx - 30,
      centerPx, centerPx, maxRadiusPx
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerPx, centerPx, maxRadiusPx, 0, 2 * Math.PI);
    ctx.fill();

    // Metallic bezel
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerPx, centerPx, maxRadiusPx, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw pattern to screen canvas
    drawCompositeScene();
  }, [
    params.wavelength,
    params.wavelengthPreset,
    params.radiusCurvature,
    params.lensDisplacement,
    params.mediumRefractiveIndex,
    params.lightMode,
    params.intensity,
    params.contrast,
    params.magnification,
    params.hasIrregularity,
    params.irregularityType,
    params.irregularityMagnitude,
  ]);

  // 2. Fast Composite Draw (Runs in < 0.2ms!)
  // Combines cached background pattern with crosshair & markers
  const drawCompositeScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw cached pattern
    if (offscreenRef.current) {
      ctx.drawImage(offscreenRef.current, 0, 0);
    }

    // Ring Order Markers (if toggled)
    if (params.showRingMarkers && !params.hasIrregularity) {
      ctx.save();
      ctx.font = '10px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const ringOrders = [1, 2, 4, 6, 8, 10, 12, 14, 16];
      for (const n of ringOrders) {
        const diamMm = getTheoreticalRingDiameterMm(n, params, true);
        const radiusPx = (diamMm / 2) * mmToPixels;
        if (radiusPx > 10 && radiusPx < maxRadiusPx - 15) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.setLineDash([3, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerPx, centerPx, radiusPx, 0, 2 * Math.PI);
          ctx.stroke();

          const angle = Math.PI / 4;
          const lx = centerPx + radiusPx * Math.cos(angle);
          const ly = centerPx - radiusPx * Math.sin(angle);

          ctx.fillStyle = 'rgba(12, 18, 34, 0.75)';
          ctx.fillRect(lx - 12, ly - 7, 24, 14);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.setLineDash([]);
          ctx.strokeRect(lx - 12, ly - 7, 24, 14);

          ctx.fillStyle = '#38bdf8';
          ctx.fillText(`n=${n}`, lx, ly);
        }
      }
      ctx.restore();
    }

    // Draw Travelling Microscope Crosshair
    if (params.showCrosshairs) {
      const crosshairXPx = centerPx + (microscope.positionX - microscope.zeroError) * mmToPixels;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerPx, centerPx, maxRadiusPx - 1, 0, 2 * Math.PI);
      ctx.clip();

      // Horizontal reference crosswire
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, centerPx);
      ctx.lineTo(CANVAS_SIZE, centerPx);
      ctx.stroke();

      // Tick marks on horizontal line
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      for (let tickMm = -5; tickMm <= 5; tickMm += 1) {
        const tx = centerPx + tickMm * mmToPixels;
        ctx.beginPath();
        ctx.moveTo(tx, centerPx - 4);
        ctx.lineTo(tx, centerPx + 4);
        ctx.stroke();
      }

      // Vertical travelling crosswire
      ctx.strokeStyle = isDraggingRef.current ? '#38bdf8' : '#67e8f9';
      ctx.lineWidth = isDraggingRef.current ? 2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(crosshairXPx, 0);
      ctx.lineTo(crosshairXPx, CANVAS_SIZE);
      ctx.stroke();

      // Central cross bracket
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(crosshairXPx - 5, centerPx - 5, 10, 10);

      // Digital coordinate readout tag on wire
      ctx.fillStyle = 'rgba(12, 18, 34, 0.9)';
      const posLabel = `${microscope.positionX >= 0 ? '+' : ''}${microscope.positionX.toFixed(2)} mm`;
      ctx.fillRect(crosshairXPx - 30, 18, 60, 18);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(crosshairXPx - 30, 20, 60, 18);

      ctx.font = '11px "Fira Code", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(posLabel, crosshairXPx, 27);

      ctx.restore();
    }

    // Scale bar
    ctx.save();
    const barMm = 1.0;
    const barPx = barMm * mmToPixels;
    const barX = 24;
    const barY = CANVAS_SIZE - 24;

    ctx.fillStyle = 'rgba(12, 18, 34, 0.85)';
    ctx.fillRect(barX - 6, barY - 16, barPx + 12, 22);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeRect(barX - 6, barY - 16, barPx + 12, 22);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + barPx, barY);
    ctx.moveTo(barX, barY - 3);
    ctx.lineTo(barX, barY + 3);
    ctx.moveTo(barX + barPx, barY - 3);
    ctx.lineTo(barX + barPx, barY + 3);
    ctx.stroke();

    ctx.font = '9px "Fira Code", monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(`${barMm} mm`, barX + barPx / 2, barY - 5);
    ctx.restore();
  }, [
    microscope.positionX,
    microscope.zeroError,
    params.showCrosshairs,
    params.showRingMarkers,
    params.hasIrregularity,
    mmToPixels,
    centerPx,
    maxRadiusPx,
    params,
  ]);

  // Re-draw crosshair whenever microscope position updates
  useEffect(() => {
    drawCompositeScene();
  }, [drawCompositeScene]);

  // Rock-solid Pointer Dragging (Prevents jitter & captures cursor outside canvas)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const pxX = (clientX * CANVAS_SIZE) / rect.width;
    const dxFromCenterMm = (pxX - centerPx) / mmToPixels;

    const clampedX = Math.max(-6.5, Math.min(6.5, dxFromCenterMm));
    const snappedX = Math.round(clampedX / microscope.leastCount) * microscope.leastCount;
    onMicroscopeMove(Number(snappedX.toFixed(2)));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const pxX = (clientX * CANVAS_SIZE) / rect.width;
    const pxY = (clientY * CANVAS_SIZE) / rect.height;

    const dxMm = (pxX - centerPx) / mmToPixels;
    const dyMm = (pxY - centerPx) / mmToPixels;
    const rMm = Math.sqrt(dxMm * dxMm + dyMm * dyMm);

    if (isDraggingRef.current) {
      const clampedX = Math.max(-6.5, Math.min(6.5, dxMm));
      const snappedX = Math.round(clampedX / microscope.leastCount) * microscope.leastCount;
      onMicroscopeMove(Number(snappedX.toFixed(2)));
    }

    // Telemetry update
    const rMeters = rMm * 1e-3;
    const tNm = ((rMeters * rMeters) / (2 * params.radiusCurvature) + params.lensDisplacement * 1e-9) * 1e9;
    const opdNm = 2 * params.mediumRefractiveIndex * tNm;

    let nearestN: number | undefined;
    for (let n = 1; n <= 24; n++) {
      const diam = getTheoreticalRingDiameterMm(n, params, true);
      if (Math.abs(rMm - diam / 2) < 0.08) {
        nearestN = n;
        break;
      }
    }

    setHoverInfo({
      rMm: Number(rMm.toFixed(2)),
      tNm: Number(tNm.toFixed(1)),
      opdNm: Number(opdNm.toFixed(1)),
      nearestRing: nearestN,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Eyepiece Canvas Frame */}
      <div className="relative p-2 rounded-2xl bg-gradient-to-b from-slate-900 via-lab-900 to-slate-950 border border-slate-700/60 shadow-2xl flex flex-col items-center">
        {/* Floating Projection Switcher & Status Bar */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-lab-950/80 border border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-2 text-sky-400">
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-200">MICROSCOPE EYEPIECE</span>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
              FOV: {fovMm.toFixed(1)} mm
            </span>
          </div>

          {/* Toggle between Top and Side views */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onToggleViewMode('top')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
                viewMode === 'top'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Rings</span>
            </button>

            <button
              onClick={() => onToggleViewMode('side')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
                viewMode === 'side'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Ray Optics</span>
            </button>
          </div>
        </div>

        {/* Circular Viewport (Fixed dimensions, NO CSS animation jitter) */}
        <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] xl:w-[510px] xl:h-[510px] rounded-full overflow-hidden border-4 border-slate-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full object-contain touch-none"
          />

          {/* Glare overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-sky-400/10" />
        </div>

        {/* Stable Fixed-Height Telemetry HUD (Prevents any DOM wrapping shake) */}
        <div className="w-full h-9 mt-2 px-3 rounded-lg bg-lab-950/90 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300 overflow-hidden">
          <div className="flex items-center space-x-3 text-[11px]">
            <span>
              r: <strong className="text-sky-400">{hoverInfo.rMm.toFixed(2)} mm</strong>
            </span>
            <span>
              t: <strong className="text-emerald-400">{hoverInfo.tNm.toFixed(0)} nm</strong>
            </span>
            <span>
              OPD: <strong className="text-amber-400">{hoverInfo.opdNm.toFixed(0)} nm</strong>
            </span>
          </div>

          <div className="text-[11px]">
            {hoverInfo.nearestRing ? (
              <span className="text-sky-300 font-semibold bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30">
                Dark Ring n = {hoverInfo.nearestRing}
              </span>
            ) : (
              <span className="text-slate-500">Drag crosswire to measure</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
