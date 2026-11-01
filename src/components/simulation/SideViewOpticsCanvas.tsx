import React, { useRef, useEffect, useState } from 'react';
import { OpticalParameters } from '../../types/physics';
import { wavelengthToRGB, calculateMonochromaticIntensity } from '../../physics/optics';
import { Info, Layers } from 'lucide-react';

interface Props {
  params: OpticalParameters;
}

interface Pt {
  x: number;
  y: number;
}

// Logical drawing size (the canvas backing store is scaled by devicePixelRatio)
const W = 640;
const H = 480;
const CX = W / 2;
const PX_PER_MM = 50;
// Drawn lens radius per metre of real R. Sag ~ x^2/(2*Rpx), so the wedge thickens/thins
// exactly as 1/R (halving R doubles the gap), like the real film t = r^2/(2R).
const R_PX_PER_M = 520;
const R_MIN = 0.2;
const R_MAX = 3.5;

const CREAM = '#f5f1e6';
const LIME = '#dff25a';
const ROSE = '#ff6b8a';
const EMERALD = '#34d399';
const MONO = '"JetBrains Mono", monospace';
const SANS = '"Inter", sans-serif';

/** Stroke a polyline. */
function strokePath(ctx: CanvasRenderingContext2D, pts: Pt[], color: string, width: number) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** Chevrons that travel along a polyline to show the direction of propagation. */
function drawFlow(ctx: CanvasRenderingContext2D, pts: Pt[], color: string, time: number) {
  const segs: { a: Pt; dx: number; dy: number; len: number; start: number }[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    const len = Math.hypot(dx, dy);
    segs.push({ a: pts[i], dx, dy, len, start: total });
    total += len;
  }
  if (total < 1) return;

  const spacing = 38;
  const offset = (time * 45) % spacing;
  for (let d = offset; d <= total; d += spacing) {
    const seg = segs.find((s) => d >= s.start && d <= s.start + s.len);
    if (!seg) continue;
    const u = (d - seg.start) / seg.len;
    const fade = Math.max(0, Math.min(1, d / 18, (total - d) / 18));
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(seg.a.x + seg.dx * u, seg.a.y + seg.dy * u);
    ctx.rotate(Math.atan2(seg.dy, seg.dx));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(-4, -4.5);
    ctx.lineTo(-4, 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function fillRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
}

function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  opts: { font?: string; color?: string; align?: CanvasTextAlign } = {}
) {
  ctx.font = opts.font ?? `11px ${MONO}`;
  ctx.fillStyle = opts.color ?? CREAM;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

export const SideViewOpticsCanvas: React.FC<Props> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRayX, setSelectedRayX] = useState<number>(1.8); // mm from optical centre
  // Text-box draft so the user can type freely (e.g. "2." or "") before it is committed
  const [rayDraft, setRayDraft] = useState<string | null>(null);

  const commitRayDraft = () => {
    if (rayDraft !== null) {
      const v = parseFloat(rayDraft);
      if (Number.isFinite(v)) setSelectedRayX(Math.min(R_MAX, Math.max(R_MIN, Math.round(v * 100) / 100)));
      setRayDraft(null);
    }
  };

  // The animation loop reads the latest values from refs, so React never re-renders per frame
  const paramsRef = useRef(params);
  const rayRef = useRef(selectedRayX);
  paramsRef.current = params;
  rayRef.current = selectedRayX;
  const drawRef = useRef<(time: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp rendering on HiDPI / retina screens
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const draw = (time: number) => {
      const p = paramsRef.current;
      const rayMm = rayRef.current;
      const reflected = p.lightMode === 'reflected';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ---- Geometry (film thickness and angles exaggerated for clarity) ----
      const plateTopY = 330;
      const plateH = 56;
      const plateBottomY = plateTopY + plateH;
      const halfW = 230;
      const lensTopY = 110;
      // Drawn radius follows the R setting, so changing R visibly reshapes the lens surface and
      // the air wedge. Kept just above the half-width so the lens arc always stays valid.
      const Rpx = Math.max(halfW + 30, R_PX_PER_M * p.radiusCurvature);
      const liftPx = (p.lensDisplacement / 1000) * 20;
      const contactY = plateTopY - liftPx;
      const lensSurfY = (x: number) => {
        const dx = x - CX;
        return contactY - (Rpx - Math.sqrt(Math.max(0, Rpx * Rpx - dx * dx)));
      };

      const [cr, cg, cb] = wavelengthToRGB(p.wavelength);
      const beamColor = `rgb(${cr}, ${cg}, ${cb})`;
      const beamGlow = `rgba(${cr}, ${cg}, ${cb}, 0.5)`;

      // ---- Glass plate ----
      ctx.fillStyle = 'rgba(245, 241, 230, 0.07)';
      ctx.fillRect(CX - halfW - 50, plateTopY, 2 * halfW + 100, plateH);
      ctx.fillStyle = 'rgba(223, 242, 90, 0.55)';
      ctx.fillRect(CX - halfW - 50, plateTopY - 1, 2 * halfW + 100, 2); // reflecting surface
      text(ctx, `Optically flat glass plate  (μ = ${p.plateRefractiveIndex.toFixed(3)})`, CX, plateTopY + 34, {
        font: `12px ${SANS}`,
        color: 'rgba(245, 241, 230, 0.55)',
        align: 'center',
      });

      // ---- Thin film wedge between lens and plate ----
      const mediumFill =
        p.mediumPreset === 'water'
          ? 'rgba(96, 165, 250, 0.28)'
          : p.mediumPreset === 'oil'
          ? 'rgba(234, 179, 8, 0.26)'
          : p.mediumPreset === 'custom'
          ? 'rgba(138, 106, 240, 0.28)'
          : 'rgba(245, 241, 230, 0.10)';
      ctx.beginPath();
      for (let x = CX - halfW; x <= CX + halfW; x += 4) {
        const y = lensSurfY(x);
        if (x === CX - halfW) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(CX + halfW, plateTopY);
      ctx.lineTo(CX - halfW, plateTopY);
      ctx.closePath();
      ctx.fillStyle = mediumFill;
      ctx.fill();
      text(ctx, `film (${p.mediumPreset})`, CX - halfW + 8, plateTopY - 20, {
        font: `10px ${MONO}`,
        color: 'rgba(245, 241, 230, 0.6)',
      });
      text(ctx, `μ = ${p.mediumRefractiveIndex.toFixed(3)}`, CX - halfW + 8, plateTopY - 8, {
        font: `10px ${MONO}`,
        color: 'rgba(245, 241, 230, 0.6)',
      });

      // ---- Plano-convex lens ----
      const ang = Math.asin(halfW / Rpx);
      const edgeY = contactY - Rpx + Rpx * Math.cos(ang);
      ctx.beginPath();
      ctx.moveTo(CX - halfW, lensTopY);
      ctx.lineTo(CX + halfW, lensTopY);
      ctx.lineTo(CX + halfW, edgeY);
      ctx.arc(CX, contactY - Rpx, Rpx, Math.PI / 2 - ang, Math.PI / 2 + ang, false);
      ctx.closePath();
      const lensGrad = ctx.createLinearGradient(0, lensTopY, 0, contactY);
      lensGrad.addColorStop(0, 'rgba(245, 241, 230, 0.13)');
      lensGrad.addColorStop(1, 'rgba(245, 241, 230, 0.04)');
      ctx.fillStyle = lensGrad;
      ctx.fill();

      // Curved (optical) surface highlighted
      ctx.beginPath();
      ctx.arc(CX, contactY - Rpx, Rpx, Math.PI / 2 - ang, Math.PI / 2 + ang, false);
      ctx.strokeStyle = LIME;
      ctx.lineWidth = 2;
      ctx.stroke();

      text(ctx, `Plano-convex lens  (μ = ${p.lensRefractiveIndex.toFixed(3)})`, CX - halfW + 16, lensTopY + 26, {
        font: `13px ${SANS}`,
        color: CREAM,
      });
      text(ctx, `R = ${p.radiusCurvature.toFixed(2)} m  ·  not to scale`, CX - halfW + 16, lensTopY + 44, {
        font: `10px ${MONO}`,
        color: 'rgba(245, 241, 230, 0.5)',
      });
      text(ctx, `centre of curvature ↑  (R = ${p.radiusCurvature.toFixed(2)} m)`, CX - 8, lensTopY - 8, {
        font: `10px ${MONO}`,
        color: LIME,
        align: 'right',
      });

      // Optical axis
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = 'rgba(245, 241, 230, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CX, lensTopY - 16);
      ctx.lineTo(CX, plateTopY);
      ctx.stroke();
      ctx.restore();

      // ---- Contact point or lift ----
      if (liftPx > 0) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(CX, contactY);
        ctx.lineTo(CX, plateTopY);
        ctx.stroke();
        text(ctx, `lift d₀ = ${p.lensDisplacement} nm`, CX - 10, plateTopY + 16, {
          font: `10px ${MONO}`,
          color: '#fbbf24',
          align: 'right',
        });
      } else {
        ctx.fillStyle = ROSE;
        ctx.beginPath();
        ctx.arc(CX, plateTopY, 4, 0, 2 * Math.PI);
        ctx.fill();
        text(ctx, 'contact (t = 0)', CX, plateTopY - 14, {
          font: `10px ${MONO}`,
          color: ROSE,
          align: 'center',
        });
      }

      // ---- Probe ray ----
      const rx = CX + rayMm * PX_PER_MM;
      const ySurf = lensSurfY(rx);
      const topY = 46;
      const botY = 424;

      const incident: Pt[] = [{ x: rx, y: topY }, { x: rx, y: ySurf }];
      let ray1: Pt[];
      let ray2: Pt[];
      let name1: string;
      let name2: string;

      if (reflected) {
        ray1 = [{ x: rx, y: ySurf }, { x: rx + 16, y: topY }];
        ray2 = [{ x: rx, y: ySurf }, { x: rx, y: plateTopY }, { x: rx + 32, y: topY }];
        name1 = 'Ray 1 · reflected at lens / film';
        name2 = 'Ray 2 · reflected at film / plate (+π)';
      } else {
        ray1 = [
          { x: rx, y: ySurf },
          { x: rx, y: plateTopY },
          { x: rx, y: plateBottomY },
          { x: rx, y: botY },
        ];
        const bounceX = rx + 14;
        ray2 = [
          { x: rx, y: plateTopY },
          { x: bounceX, y: lensSurfY(bounceX) },
          { x: rx + 28, y: plateTopY },
          { x: rx + 28, y: plateBottomY },
          { x: rx + 28, y: botY },
        ];
        name1 = 'Ray A · transmitted directly';
        name2 = 'Ray B · two internal reflections';
      }

      ctx.save();
      ctx.shadowColor = beamGlow;
      ctx.shadowBlur = 8;
      strokePath(ctx, incident, beamColor, 2.5);
      strokePath(ctx, ray1, CREAM, 2);
      strokePath(ctx, ray2, ROSE, 2);
      ctx.restore();

      drawFlow(ctx, incident, beamColor, time);
      drawFlow(ctx, ray1, CREAM, time);
      drawFlow(ctx, ray2, ROSE, time);

      if (reflected) {
        text(ctx, '+π', rx + 8, plateTopY - 7, { font: `bold 11px ${MONO}`, color: ROSE });
      }
      text(ctx, 'incident', rx - 10, 60, { font: `10px ${MONO}`, color: beamColor, align: 'right' });

      // Thickness bracket
      ctx.strokeStyle = EMERALD;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rx - 14, ySurf);
      ctx.lineTo(rx - 14, plateTopY);
      ctx.moveTo(rx - 18, ySurf);
      ctx.lineTo(rx - 10, ySurf);
      ctx.moveTo(rx - 18, plateTopY);
      ctx.lineTo(rx - 10, plateTopY);
      ctx.stroke();
      text(ctx, 't', rx - 22, (ySurf + plateTopY) / 2 + 4, {
        font: `italic 12px ${SANS}`,
        color: EMERALD,
        align: 'right',
      });

      // Microscope objective
      const objX = rx + (reflected ? 16 : 14);
      const objY = reflected ? 8 : botY + 6;
      ctx.fillStyle = 'rgba(245, 241, 230, 0.10)';
      fillRoundRect(ctx, objX - 54, objY, 108, 24, 12);
      text(ctx, reflected ? 'to microscope ↑' : 'to microscope ↓', objX, objY + 16, {
        font: `10px ${MONO}`,
        color: LIME,
        align: 'center',
      });

      // ---- Legend ----
      const legend: [string, string][] = [
        [beamColor, 'Incident light'],
        [CREAM, name1],
        [ROSE, name2],
      ];
      legend.forEach(([color, label], i) => {
        const y = 22 + i * 18;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(24, y - 3, 4, 0, 2 * Math.PI);
        ctx.fill();
        text(ctx, label, 36, y, { font: `10px ${MONO}`, color: 'rgba(245, 241, 230, 0.8)' });
      });

      // ---- Readout panel ----
      const rMeters = rayMm * 1e-3;
      const tM = (rMeters * rMeters) / (2 * p.radiusCurvature) + p.lensDisplacement * 1e-9;
      const tNm = tM * 1e9;
      const opdNm = 2 * p.mediumRefractiveIndex * tNm;
      const order = opdNm / p.wavelength; // OPD in units of λ
      const intensity = calculateMonochromaticIntensity(tM, p.wavelength, p.mediumRefractiveIndex, reflected, 1.0);

      // Which fringe is this probe sitting on? (same conventions as getTheoreticalRingDiameterMm)
      const nearInt = Math.abs(order - Math.round(order));
      const nearHalf = Math.abs(order - (Math.floor(order) + 0.5));
      let verdict: string;
      let verdictColor: string;
      const darkN = reflected ? Math.round(order) : Math.round(order + 0.5);
      const brightN = reflected ? Math.round(order + 0.5) : Math.round(order);
      const onDarkCondition = reflected ? nearInt < 0.08 : nearHalf < 0.08;
      const onBrightCondition = reflected ? nearHalf < 0.08 : nearInt < 0.08;
      if (onDarkCondition && darkN >= 1) {
        verdict = `Dark ring n = ${darkN}`;
        verdictColor = 'rgba(245, 241, 230, 0.6)';
      } else if (onBrightCondition && brightN >= 1) {
        verdict = `Bright ring n = ${brightN}`;
        verdictColor = LIME;
      } else if (intensity > 0.85) {
        verdict = 'Near-bright (constructive)';
        verdictColor = LIME;
      } else if (intensity < 0.15) {
        verdict = 'Near-dark (destructive)';
        verdictColor = 'rgba(245, 241, 230, 0.6)';
      } else {
        verdict = 'Between fringes';
        verdictColor = '#fbbf24';
      }

      ctx.fillStyle = 'rgba(245, 241, 230, 0.06)';
      fillRoundRect(ctx, 16, 398, 300, 70, 14);
      text(ctx, `r = ${rayMm.toFixed(2)} mm     t = ${tNm.toFixed(1)} nm`, 30, 418, { color: EMERALD });
      text(ctx, `OPD = ${opdNm.toFixed(1)} nm = ${order.toFixed(2)} λ`, 30, 436, {
        color: 'rgba(245, 241, 230, 0.7)',
      });
      text(ctx, verdict, 30, 456, { font: `bold 11px ${MONO}`, color: verdictColor });

      // Intensity bar
      ctx.fillStyle = 'rgba(245, 241, 230, 0.12)';
      fillRoundRect(ctx, 232, 448, 70, 6, 3);
      ctx.fillStyle = LIME;
      fillRoundRect(ctx, 232, 448, Math.max(2, 70 * intensity), 6, 3);
      text(ctx, `I = ${intensity.toFixed(2)}`, 302, 442, {
        font: `10px ${MONO}`,
        color: 'rgba(245, 241, 230, 0.6)',
        align: 'right',
      });

      text(ctx, 'film thickness & ray angles exaggerated', W - 14, H - 10, {
        font: `9px ${MONO}`,
        color: 'rgba(245, 241, 230, 0.35)',
        align: 'right',
      });
    };

    drawRef.current = draw;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      draw(0);
      return;
    }

    let animId = 0;
    const start = performance.now();
    const loop = (now: number) => {
      draw((now - start) / 1000);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // With reduced motion there is no loop, so redraw when inputs change
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) drawRef.current(0);
  }, [params, selectedRayX]);

  // Drag directly on the diagram to move the probe ray
  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId);
    else if (e.buttons === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const mm = (x - CX) / PX_PER_MM;
    setSelectedRayX(Math.round(Math.min(R_MAX, Math.max(R_MIN, mm)) * 20) / 20);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-2 rounded-2xl bg-gradient-to-b from-slate-900 via-lab-900 to-slate-950 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-lab-950/70 text-xs">
          <div className="flex items-center space-x-2 text-sky-400 font-medium">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>OPTICAL SIDE-VIEW RAY ARRANGEMENT</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span className="text-slate-400">Drag on the diagram or use the slider to probe thickness</span>
          </div>
        </div>

        {/* Canvas Display */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={handlePointer}
          onPointerMove={handlePointer}
          className="w-[340px] h-[255px] sm:w-[480px] sm:h-[360px] lg:w-[600px] lg:h-[450px] rounded-xl bg-[#0c0c0f] cursor-ew-resize touch-none"
        />

        {/* Interactive Ray Position Controls */}
        <div className="mt-2 px-4 py-2.5 rounded-lg bg-lab-950/90 flex flex-col gap-2 text-xs font-mono text-slate-300">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-slate-400">Probe Ray Radial Position (r):</span>
            <input
              type="range"
              min={R_MIN}
              max={R_MAX}
              step="0.05"
              value={selectedRayX}
              onChange={(e) => {
                setRayDraft(null);
                setSelectedRayX(parseFloat(e.target.value));
              }}
              className="w-40 accent-sky-400"
            />
            <div className="flex items-center space-x-1">
              <input
                type="text"
                inputMode="decimal"
                aria-label="Probe ray radial position in millimetres"
                value={rayDraft ?? selectedRayX.toFixed(2)}
                onChange={(e) => setRayDraft(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={commitRayDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitRayDraft();
                    e.currentTarget.blur();
                  } else if (e.key === 'Escape') {
                    setRayDraft(null);
                    e.currentTarget.blur();
                  }
                }}
                className="w-20 px-2 py-1 rounded-md bg-lab-900 border border-slate-700 text-sky-400 font-semibold text-right focus:outline-none focus:border-sky-400"
              />
              <span className="text-sky-400 font-semibold">mm</span>
            </div>
            <span className="text-[10px] text-slate-500">
              (range {R_MIN} – {R_MAX} mm)
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Reflection at glass plate boundary undergoes π phase reversal (Stokes' relation)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
