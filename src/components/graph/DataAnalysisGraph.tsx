import React, { useState } from 'react';
import { ObservationRecord, OpticalParameters } from '../../types/physics';
import {
  calculateLinearRegression,
  computeExperimentalResults,
  getTheoreticalRingDiameterMm,
} from '../../physics/optics';
import {
  TrendingUp,
  BarChart3,
  LineChart,
  GitCompare,
  HelpCircle,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  airRecords: ObservationRecord[];
  liquidRecords: ObservationRecord[];
  params: OpticalParameters;
}

export const DataAnalysisGraph: React.FC<Props> = ({
  airRecords,
  liquidRecords,
  params,
}) => {
  const [activePlot, setActivePlot] = useState<'d2_vs_n' | 'r_vs_n' | 'comparison'>('d2_vs_n');
  const [hoveredPoint, setHoveredPoint] = useState<{
    n: number;
    d2: number;
    d2Theo: number;
    residual: number;
    px: number;
    py: number;
  } | null>(null);

  // Compute regressions
  const airRegression = calculateLinearRegression(airRecords);
  const liquidRegression = calculateLinearRegression(liquidRecords);
  const airResults = computeExperimentalResults(airRecords, { ...params, mediumRefractiveIndex: 1.0 });

  // Theoretical slope for current parameters: S = 4 * lambda * R / mu (in mm^2/order)
  const theoreticalSlope = (4 * (params.wavelength * 1e-9) * params.radiusCurvature / params.mediumRefractiveIndex) * 1e6;

  // Active dataset for single plot
  const activeRecords = airRecords.filter((r) => r.diameterSquared > 0);
  const activeReg = airRegression;

  // SVG Chart Dimensions
  const SVG_WIDTH = 680;
  const SVG_HEIGHT = 400;
  const MARGIN = { top: 30, right: 30, bottom: 50, left: 65 };
  const CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Determine scale ranges
  const maxN = Math.max(20, ...activeRecords.map((r) => r.ringOrder));
  const maxD2 = Math.max(
    theoreticalSlope * maxN * 1.15,
    ...activeRecords.map((r) => r.diameterSquared * 1.15),
    20
  );

  const scaleX = (n: number) => MARGIN.left + (n / maxN) * CHART_WIDTH;
  const scaleY = (d2: number) => MARGIN.top + CHART_HEIGHT - (d2 / maxD2) * CHART_HEIGHT;

  // Radius plot scales
  const maxRadiusMm = Math.sqrt(maxD2) / 2;
  const scaleRadiusY = (rMm: number) => MARGIN.top + CHART_HEIGHT - (rMm / maxRadiusMm) * CHART_HEIGHT;

  return (
    <div className="w-full space-y-4">
      {/* Top Header & Chart Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-lab-900/90 border border-slate-800">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
            GRAPHICAL REGRESSION & INTERFEROMETRIC ANALYSIS
          </h3>
        </div>

        {/* Plot view selector */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            onClick={() => setActivePlot('d2_vs_n')}
            className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
              activePlot === 'd2_vs_n'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-md font-bold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>D² vs n (Wavelength & R)</span>
          </button>

          <button
            onClick={() => setActivePlot('r_vs_n')}
            className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
              activePlot === 'r_vs_n'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md font-bold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>r vs n (Progressive Crowding)</span>
          </button>

          <button
            onClick={() => setActivePlot('comparison')}
            className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
              activePlot === 'comparison'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md font-bold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Air vs Liquid (μ determination)</span>
          </button>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Chart Frame (Col 1-3) */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-lab-900/90 border border-slate-800 shadow-xl relative">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-auto min-w-[500px]"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Background grid */}
              <rect
                x={MARGIN.left}
                y={MARGIN.top}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                fill="#070b14"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Grid Lines X */}
              {Array.from({ length: 11 }).map((_, i) => {
                const n = (i * maxN) / 10;
                const x = scaleX(n);
                return (
                  <g key={`grid-x-${i}`}>
                    <line
                      x1={x}
                      y1={MARGIN.top}
                      x2={x}
                      y2={MARGIN.top + CHART_HEIGHT}
                      stroke="#17223b"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={x}
                      y={MARGIN.top + CHART_HEIGHT + 18}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {Math.round(n)}
                    </text>
                  </g>
                );
              })}

              {/* Grid Lines Y */}
              {Array.from({ length: 6 }).map((_, i) => {
                const val = (i * (activePlot === 'r_vs_n' ? maxRadiusMm : maxD2)) / 5;
                const y = activePlot === 'r_vs_n' ? scaleRadiusY(val) : scaleY(val);
                return (
                  <g key={`grid-y-${i}`}>
                    <line
                      x1={MARGIN.left}
                      y1={y}
                      x2={MARGIN.left + CHART_WIDTH}
                      y2={y}
                      stroke="#17223b"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={MARGIN.left - 8}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Axes Titles */}
              <text
                x={MARGIN.left + CHART_WIDTH / 2}
                y={SVG_HEIGHT - 12}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="sans-serif"
                textAnchor="middle"
                fontWeight="500"
              >
                Ring Order (n) →
              </text>

              <text
                x={-SVG_HEIGHT / 2}
                y={20}
                transform="rotate(-90)"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="sans-serif"
                textAnchor="middle"
                fontWeight="500"
              >
                {activePlot === 'r_vs_n' ? 'Ring Radius r (mm) →' : 'Square of Diameter D² (mm²) →'}
              </text>

              {/* PLOT 1: D² vs n */}
              {activePlot === 'd2_vs_n' && (
                <>
                  {/* Theoretical Line: D² = 4λR/μ * n */}
                  <line
                    x1={scaleX(0)}
                    y1={scaleY(0)}
                    x2={scaleX(maxN)}
                    y2={scaleY(theoreticalSlope * maxN)}
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                  />

                  {/* Linear Regression Best Fit Line */}
                  {activeReg.validCount >= 2 && activeReg.slope > 0 && (
                    <line
                      x1={scaleX(0)}
                      y1={scaleY(activeReg.intercept)}
                      x2={scaleX(maxN)}
                      y2={scaleY(activeReg.slope * maxN + activeReg.intercept)}
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Experimental Data Points */}
                  {activeRecords.map((r) => {
                    const cx = scaleX(r.ringOrder);
                    const cy = scaleY(r.diameterSquared);
                    const theoD2 = theoreticalSlope * r.ringOrder;

                    return (
                      <g
                        key={r.id}
                        className="cursor-pointer transition-transform"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            n: r.ringOrder,
                            d2: r.diameterSquared,
                            d2Theo: Number(theoD2.toFixed(4)),
                            residual: Number((r.diameterSquared - theoD2).toFixed(4)),
                            px: cx,
                            py: cy,
                          })
                        }
                      >
                        {/* Outer glow circle */}
                        <circle cx={cx} cy={cy} r="6" fill="#38bdf8" fillOpacity="0.25" />
                        {/* Center data point */}
                        <circle cx={cx} cy={cy} r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                      </g>
                    );
                  })}
                </>
              )}

              {/* PLOT 2: r vs n (Progressive Crowding) */}
              {activePlot === 'r_vs_n' && (
                <>
                  {/* Parabolic / Square Root Curve: r = sqrt(n * lambda * R / mu) */}
                  <path
                    d={Array.from({ length: 100 })
                      .map((_, i) => {
                        const nVal = (i / 100) * maxN;
                        const rMm = Math.sqrt((nVal * (params.wavelength * 1e-9) * params.radiusCurvature) / params.mediumRefractiveIndex) * 1000;
                        const px = scaleX(nVal);
                        const py = scaleRadiusY(rMm);
                        return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2.5"
                  />

                  {/* Experimental Radius Points */}
                  {activeRecords.map((r) => {
                    const rMm = r.diameter / 2;
                    const cx = scaleX(r.ringOrder);
                    const cy = scaleRadiusY(rMm);
                    return (
                      <g key={r.id}>
                        <circle cx={cx} cy={cy} r="6" fill="#a855f7" fillOpacity="0.25" />
                        <circle cx={cx} cy={cy} r="3.5" fill="#c084fc" stroke="#ffffff" strokeWidth="1" />
                      </g>
                    );
                  })}
                </>
              )}

              {/* PLOT 3: Comparative Air vs Liquid */}
              {activePlot === 'comparison' && (
                <>
                  {/* Air Regression Line */}
                  {airRegression.validCount >= 2 && airRegression.slope > 0 && (
                    <line
                      x1={scaleX(0)}
                      y1={scaleY(airRegression.intercept)}
                      x2={scaleX(maxN)}
                      y2={scaleY(airRegression.slope * maxN + airRegression.intercept)}
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  )}

                  {/* Liquid Regression Line */}
                  {liquidRegression.validCount >= 2 && liquidRegression.slope > 0 && (
                    <line
                      x1={scaleX(0)}
                      y1={scaleY(liquidRegression.intercept)}
                      x2={scaleX(maxN)}
                      y2={scaleY(liquidRegression.slope * maxN + liquidRegression.intercept)}
                      stroke="#06b6d4"
                      strokeWidth="2"
                    />
                  )}

                  {/* Air points */}
                  {airRecords.filter(r => r.diameterSquared > 0).map((r) => (
                    <circle key={`air-${r.id}`} cx={scaleX(r.ringOrder)} cy={scaleY(r.diameterSquared)} r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                  ))}

                  {/* Liquid points */}
                  {liquidRecords.filter(r => r.diameterSquared > 0).map((r) => (
                    <circle key={`liq-${r.id}`} cx={scaleX(r.ringOrder)} cy={scaleY(r.diameterSquared)} r="3.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
                  ))}
                </>
              )}

              {/* Hover Tooltip Overlay in SVG */}
              {hoveredPoint && (
                <g transform={`translate(${Math.min(SVG_WIDTH - 150, hoveredPoint.px + 10)}, ${Math.max(MARGIN.top, hoveredPoint.py - 50)})`}>
                  <rect x="0" y="0" width="135" height="54" rx="4" fill="#0c1222" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
                  <text x="8" y="16" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Ring n = {hoveredPoint.n}
                  </text>
                  <text x="8" y="30" fill="#e2e8f0" fontSize="9" fontFamily="monospace">
                    D²_exp: {hoveredPoint.d2.toFixed(3)} mm²
                  </text>
                  <text x="8" y="44" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                    Residual: {hoveredPoint.residual > 0 ? '+' : ''}{hoveredPoint.residual.toFixed(3)} mm²
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs font-mono text-slate-300 border-t border-slate-800 pt-2">
            {activePlot === 'd2_vs_n' && (
              <>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-sky-400 inline-block" />
                  <span>Experimental Best-Fit Line</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-sky-400/50 inline-block" />
                  <span>Theoretical Dₙ² Line</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-white inline-block" />
                  <span>Recorded Ring Points</span>
                </div>
              </>
            )}

            {activePlot === 'r_vs_n' && (
              <div className="flex items-center space-x-2 text-purple-300">
                <span className="w-3 h-0.5 bg-purple-400 inline-block" />
                <span>Square-root relationship r ∝ √n (demonstrates ring crowding)</span>
              </div>
            )}

            {activePlot === 'comparison' && (
              <>
                <div className="flex items-center space-x-1.5 text-sky-300">
                  <span className="w-3 h-0.5 bg-sky-400 inline-block" />
                  <span>Air Slope: S_air = {airRegression.slope.toFixed(3)}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-cyan-300">
                  <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
                  <span>Liquid Slope: S_liq = {liquidRegression.slope.toFixed(3)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Statistical Analysis Dashboard Cards (Col 4) */}
        <div className="space-y-3 font-mono text-xs">
          {/* Card 1: Linear Regression Metrics */}
          <div className="p-3.5 rounded-xl bg-lab-900/90 border border-slate-800">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-2 font-semibold">
              Linear Fit: D² = S·n + C
            </span>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Slope (S):</span>
                <span className="text-sky-300 font-bold">
                  {activeReg.slope > 0 ? `${activeReg.slope.toFixed(4)} mm²/order` : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Intercept (C):</span>
                <span className="text-slate-300">
                  {activeReg.validCount >= 2 ? `${activeReg.intercept.toFixed(4)} mm²` : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Fit Quality (R²):</span>
                <span className="text-emerald-400 font-bold">
                  {activeReg.validCount >= 2 ? activeReg.r2.toFixed(4) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Derived Physical Constants */}
          <div className="p-3.5 rounded-xl bg-lab-900/90 border border-slate-800">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-2 font-semibold">
              Experimental Quantities
            </span>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Wavelength (λ_exp):</span>
                  <span className="text-sky-300 font-bold">
                    {airResults.experimentalWavelength
                      ? `${airResults.experimentalWavelength.toFixed(1)} nm`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>True λ: {params.wavelength} nm</span>
                  {airResults.wavelengthErrorPercent !== undefined && (
                    <span className="text-amber-400">
                      Err: {airResults.wavelengthErrorPercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Curvature (R_exp):</span>
                  <span className="text-emerald-300 font-bold">
                    {airResults.experimentalRadius
                      ? `${airResults.experimentalRadius.toFixed(3)} m`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>True R: {params.radiusCurvature.toFixed(2)} m</span>
                  {airResults.radiusErrorPercent !== undefined && (
                    <span className="text-amber-400">
                      Err: {airResults.radiusErrorPercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              {/* If Liquid dataset has data */}
              {liquidRegression.slope > 0 && airRegression.slope > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Liquid Index (μ_exp):</span>
                    <span className="text-cyan-300 font-bold">
                      {(airRegression.slope / liquidRegression.slope).toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>True μ: {params.mediumRefractiveIndex.toFixed(3)}</span>
                    <span className="text-amber-400">
                      Err:{' '}
                      {Math.abs(
                        ((airRegression.slope / liquidRegression.slope - params.mediumRefractiveIndex) /
                          params.mediumRefractiveIndex) *
                          100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3 rounded-xl bg-lab-950 border border-sky-950 text-[11px] text-slate-400">
            <span className="text-sky-300 font-semibold block mb-1">Physics Insights:</span>
            <span>
              The slope of D² vs n is directly proportional to 4λR/μ. A straight line verifies thin film interference theory.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
