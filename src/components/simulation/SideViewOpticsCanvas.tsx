import React, { useRef, useEffect, useState } from 'react';
import { OpticalParameters } from '../../types/physics';
import { wavelengthToRGB } from '../../physics/optics';
import { Eye, Info, Sparkles, Layers, ArrowDown, ArrowUp } from 'lucide-react';

interface Props {
  params: OpticalParameters;
}

export const SideViewOpticsCanvas: React.FC<Props> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRayX, setSelectedRayX] = useState<number>(1.8); // in mm from optical center
  const [animOffset, setAnimOffset] = useState<number>(0);

  // Animation loop for wave propagation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setAnimOffset(prev => (prev + 0.5) % 20);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 480;
    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping
    const centerX = width / 2;
    const plateTopY = 320; // Top surface of flat glass plate
    const plateThickness = 60;

    // Lens parameters for diagram (exaggerated for visual clarity of thin film)
    const lensWidth = 460;
    const lensCurvatureRadiusPx = 700; // Visual radius
    const liftPx = (params.lensDisplacement / 1000) * 20; // 0 to 60px for displacement
    const contactY = plateTopY - liftPx;

    const [r, g, b] = wavelengthToRGB(params.wavelength);
    const beamColor = `rgb(${r}, ${g}, ${b})`;
    const beamGlow = `rgba(${r}, ${g}, ${b}, 0.5)`;

    // 1. Draw Glass Plate (Bottom)
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(centerX - lensWidth / 2 - 40, plateTopY, lensWidth + 80, plateThickness);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - lensWidth / 2 - 40, plateTopY, lensWidth + 80, plateThickness);

    // Label Glass Plate
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Optically Flat Glass Plate (μ_plate = ${params.plateRefractiveIndex.toFixed(3)})`,
      centerX,
      plateTopY + 35
    );

    // 2. Draw Intervening Medium Film
    if (params.mediumPreset !== 'air' || liftPx > 0) {
      ctx.fillStyle =
        params.mediumPreset === 'water'
          ? 'rgba(56, 189, 248, 0.15)'
          : params.mediumPreset === 'oil'
          ? 'rgba(234, 179, 8, 0.15)'
          : 'rgba(148, 163, 184, 0.1)';
      ctx.fillRect(centerX - lensWidth / 2, contactY - 15, lensWidth, plateTopY - contactY + 30);
    }

    // 3. Draw Plano-Convex Lens
    // Top flat surface of lens
    const lensTopY = 120;
    ctx.beginPath();
    // Flat top
    ctx.moveTo(centerX - lensWidth / 2, lensTopY);
    ctx.lineTo(centerX + lensWidth / 2, lensTopY);
    // Right vertical edge
    ctx.lineTo(centerX + lensWidth / 2, lensTopY + 70);
    // Curved bottom: circular arc touching contactY at x = centerX
    // y = contactY - (lensCurvatureRadiusPx - sqrt(R^2 - x^2))
    ctx.arc(
      centerX,
      contactY - lensCurvatureRadiusPx,
      lensCurvatureRadiusPx,
      Math.PI / 2 - 0.33,
      Math.PI / 2 + 0.33,
      false
    );
    // Left vertical edge
    ctx.lineTo(centerX - lensWidth / 2, lensTopY);
    ctx.closePath();

    ctx.fillStyle = 'rgba(30, 58, 138, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Label Plano-convex lens
    ctx.fillStyle = '#bae6fd';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText(
      `Plano-Convex Lens (R = ${params.radiusCurvature.toFixed(2)} m, μ_lens = ${params.lensRefractiveIndex.toFixed(3)})`,
      centerX,
      lensTopY + 28
    );

    // Radius of curvature arrow indicator
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, contactY - 100);
    ctx.lineTo(centerX + 120, contactY - 100 - 80);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px "Fira Code", monospace';
    ctx.fillText('R (Curvature)', centerX + 70, contactY - 135);

    // 4. Contact point or Lift indicator
    if (liftPx > 0) {
      // Dimension line showing d0
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, contactY);
      ctx.lineTo(centerX, plateTopY);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = '11px "Fira Code", monospace';
      ctx.fillText(`d₀ = ${params.lensDisplacement} nm`, centerX + 45, (contactY + plateTopY) / 2 + 4);
    } else {
      // Contact point dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, plateTopY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText('Point of Contact (t = 0)', centerX, plateTopY - 10);
    }

    // 5. Active Ray Optics Diagram at selectedRayX
    const rayDistMm = selectedRayX;
    const rayPxX = centerX + rayDistMm * 50;

    // Compute curved surface Y at this X
    const dxPx = rayPxX - centerX;
    const lensBottomY = contactY - (lensCurvatureRadiusPx - Math.sqrt(Math.max(0, lensCurvatureRadiusPx * lensCurvatureRadiusPx - dxPx * dxPx)));
    const filmThicknessPx = plateTopY - lensBottomY;

    // Incident Ray (From top through glass beam splitter)
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = beamGlow;
    ctx.shadowBlur = 8;

    // Ray coming straight down
    ctx.beginPath();
    ctx.moveTo(rayPxX, 40);
    ctx.lineTo(rayPxX, lensBottomY);
    ctx.stroke();

    // Arrows on incident ray
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(rayPxX, 75);
    ctx.lineTo(rayPxX - 4, 65);
    ctx.lineTo(rayPxX + 4, 65);
    ctx.fill();

    // Ray 1: Reflected at lower curved surface of lens
    const ray1X = rayPxX - 12;
    ctx.strokeStyle = '#38bdf8'; // Blue-cyan reflection
    ctx.beginPath();
    ctx.moveTo(rayPxX, lensBottomY);
    ctx.lineTo(ray1X, 40);
    ctx.stroke();

    // Arrow on Ray 1
    ctx.beginPath();
    ctx.moveTo(ray1X + 4, 60);
    ctx.lineTo(ray1X, 50);
    ctx.lineTo(ray1X + 8, 52);
    ctx.fill();

    // Ray 2: Enters thin film, reflects at plate surface, and emerges
    ctx.strokeStyle = '#a855f7'; // Purple ray through medium
    ctx.beginPath();
    ctx.moveTo(rayPxX, lensBottomY);
    ctx.lineTo(rayPxX, plateTopY);
    ctx.stroke();

    // Ray 2 emerging reflection
    const ray2X = rayPxX - 24;
    ctx.strokeStyle = '#f43f5e'; // Rose ray with pi phase shift
    ctx.beginPath();
    ctx.moveTo(rayPxX, plateTopY);
    ctx.lineTo(ray2X, 40);
    ctx.stroke();

    // Arrow on Ray 2
    ctx.beginPath();
    ctx.moveTo(ray2X + 4, 60);
    ctx.lineTo(ray2X, 50);
    ctx.lineTo(ray2X + 8, 52);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Label Rays & Optical path
    ctx.font = '11px "Fira Code", monospace';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText('Ray 1 (Lens surface)', ray1X - 60, 50);

    ctx.fillStyle = '#fb7185';
    ctx.fillText('Ray 2 (Plate surface, +π shift)', ray2X - 70, 70);

    // Microscope Objective Indicator at top
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(rayPxX - 50, 10, 80, 25);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(rayPxX - 50, 10, 80, 25);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillText('To Microscope', rayPxX - 10, 26);

    // Callout box for Thin Film thickness t
    const calloutX = rayPxX + 40;
    const calloutY = (lensBottomY + plateTopY) / 2;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rayPxX + 5, lensBottomY);
    ctx.lineTo(calloutX, calloutY - 15);
    ctx.moveTo(rayPxX + 5, plateTopY);
    ctx.lineTo(calloutX, calloutY + 15);
    ctx.stroke();

    // Thickness dimension bracket
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rayPxX + 15, lensBottomY);
    ctx.lineTo(rayPxX + 15, plateTopY);
    ctx.stroke();

    // Physical calculations for callout
    const rMeters = Math.abs(rayDistMm) * 1e-3;
    const tNm = ((rMeters * rMeters) / (2 * params.radiusCurvature) + params.lensDisplacement * 1e-9) * 1e9;
    const opdNm = 2 * params.mediumRefractiveIndex * tNm;

    ctx.fillStyle = 'rgba(12, 18, 34, 0.9)';
    ctx.fillRect(calloutX + 5, calloutY - 28, 160, 56);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(calloutX + 5, calloutY - 28, 160, 56);

    ctx.font = '11px "Fira Code", monospace';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'left';
    ctx.fillText(`Film t = ${tNm.toFixed(1)} nm`, calloutX + 12, calloutY - 10);
    ctx.fillText(`OPD = 2μt = ${opdNm.toFixed(1)} nm`, calloutX + 12, calloutY + 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Medium: ${params.mediumPreset} (μ=${params.mediumRefractiveIndex})`, calloutX + 12, calloutY + 20);

  }, [params, selectedRayX, animOffset]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-2 rounded-2xl bg-gradient-to-b from-slate-900 via-lab-900 to-slate-950 border border-slate-700/60 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-lab-950/70 border border-sky-950/50 text-xs">
          <div className="flex items-center space-x-2 text-sky-400 font-medium">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>OPTICAL SIDE-VIEW RAY ARRANGEMENT</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span className="text-slate-400">Drag ray slider below to probe thickness</span>
          </div>
        </div>

        {/* Canvas Display */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-[340px] h-[255px] sm:w-[480px] sm:h-[360px] lg:w-[600px] lg:h-[450px] object-contain rounded-xl border border-slate-800 bg-[#090e1c]"
        />

        {/* Interactive Ray Position Slider */}
        <div className="mt-2 px-4 py-2.5 rounded-lg bg-lab-950/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-slate-400">Probe Ray Radial Position (r):</span>
            <input
              type="range"
              min="0.2"
              max="3.5"
              step="0.05"
              value={selectedRayX}
              onChange={(e) => setSelectedRayX(parseFloat(e.target.value))}
              className="w-40 accent-sky-400"
            />
            <span className="text-sky-400 font-semibold">{selectedRayX.toFixed(2)} mm</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Reflection at glass plate boundary undergoes π phase reversal (Stokes' relation)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
