import React from 'react';
import { ObservationRecord, OpticalParameters } from '../../types/physics';
import {
  calculateLinearRegression,
  computeExperimentalResults,
  computeLiquidRefractiveIndex,
} from '../../physics/optics';
import {
  Calculator,
  Percent,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Sigma,
} from 'lucide-react';

interface Props {
  airRecords: ObservationRecord[];
  liquidRecords: ObservationRecord[];
  params: OpticalParameters;
}

export const CalculationDashboard: React.FC<Props> = ({
  airRecords,
  liquidRecords,
  params,
}) => {
  const validAir = airRecords.filter((r) => r.diameterSquared > 0);
  const airRegression = calculateLinearRegression(airRecords);
  const liquidRegression = calculateLinearRegression(liquidRecords);
  const airResults = computeExperimentalResults(airRecords, params);

  // Compute ring differences D_{n+m}^2 - D_n^2 for m = 4 or m = 6
  const pairDifferences: Array<{
    n: number;
    m: number;
    npm: number;
    d2N: number;
    d2Npm: number;
    diff: number; // mm^2
    calcLambda: number; // nm
  }> = [];

  const mSpan = 4; // Standard m interval in university labs
  for (let i = 0; i < validAir.length; i++) {
    const recN = validAir[i];
    const recNpm = validAir.find((r) => r.ringOrder === recN.ringOrder + mSpan);
    if (recNpm) {
      const diff = recNpm.diameterSquared - recN.diameterSquared; // in mm^2
      // lambda = (diff in m^2 * mu) / (4 * m * R)
      const diffM2 = diff * 1e-6;
      const lambdaM = (diffM2 * params.mediumRefractiveIndex) / (4 * mSpan * params.radiusCurvature);
      const lambdaNm = lambdaM * 1e9;
      pairDifferences.push({
        n: recN.ringOrder,
        m: mSpan,
        npm: recNpm.ringOrder,
        d2N: recN.diameterSquared,
        d2Npm: recNpm.diameterSquared,
        diff,
        calcLambda: lambdaNm,
      });
    }
  }

  // Mean from pair differences
  const meanPairLambda =
    pairDifferences.length > 0
      ? pairDifferences.reduce((acc, p) => acc + p.calcLambda, 0) / pairDifferences.length
      : undefined;

  const pairLambdaError =
    meanPairLambda !== undefined
      ? Math.abs((meanPairLambda - params.wavelength) / params.wavelength) * 100
      : undefined;

  // Refractive index calculation
  const liquidResults = computeLiquidRefractiveIndex(airRecords, liquidRecords);
  const expMu = liquidResults.calculatedMu;
  const muError =
    expMu !== undefined
      ? Math.abs((expMu - params.mediumRefractiveIndex) / params.mediumRefractiveIndex) * 100
      : undefined;

  return (
    <div className="w-full space-y-5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-lab-900/90 border border-slate-800">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
            AUTOMATIC CALCULATIONS & THEORETICAL VERIFICATION
          </h3>
        </div>

        <div className="text-xs font-mono text-slate-400">
          SI Internal Standard Formulation
        </div>
      </div>

      {/* Main Calculation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Wavelength via Graphical Regression */}
        <div className="lab-panel p-4 rounded-xl bg-lab-900/90 border border-sky-900/40">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wide">
              1. Wavelength (Slope Method)
            </span>
            <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
              Method I
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
              Formula: <strong className="text-sky-300">λ = (S · μ) / (4 · R)</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Graph Slope (S):</span>
              <span className="text-slate-200">
                {airRegression.slope > 0 ? `${airRegression.slope.toFixed(4)} mm²/order` : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Experimental λ:</span>
              <span className="text-sky-400 font-bold">
                {airResults.experimentalWavelength
                  ? `${airResults.experimentalWavelength.toFixed(1)} nm`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Theoretical λ:</span>
              <span className="text-slate-300 font-bold">{params.wavelength} nm</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Percentage Error:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  airResults.wavelengthErrorPercent !== undefined && airResults.wavelengthErrorPercent < 3
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                }`}
              >
                {airResults.wavelengthErrorPercent !== undefined
                  ? `${airResults.wavelengthErrorPercent.toFixed(2)} %`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Wavelength via Ring Difference (D_{n+m}^2 - D_n^2) */}
        <div className="lab-panel p-4 rounded-xl bg-lab-900/90 border border-sky-900/40">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wide">
              2. Wavelength (Pair Difference)
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              Method II (m=4)
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
              Formula: <strong className="text-emerald-300">λ = (D²ₙ₊ₘ - D²ₙ) · μ / (4mR)</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Mean Ring Diff (ΔD²):</span>
              <span className="text-slate-200">
                {pairDifferences.length > 0
                  ? `${(
                      pairDifferences.reduce((a, b) => a + b.diff, 0) / pairDifferences.length
                    ).toFixed(3)} mm²`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Mean Experimental λ:</span>
              <span className="text-emerald-400 font-bold">
                {meanPairLambda ? `${meanPairLambda.toFixed(1)} nm` : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Theoretical λ:</span>
              <span className="text-slate-300 font-bold">{params.wavelength} nm</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Percentage Error:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  pairLambdaError !== undefined && pairLambdaError < 3
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                }`}
              >
                {pairLambdaError !== undefined ? `${pairLambdaError.toFixed(2)} %` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Radius of Curvature Determination */}
        <div className="lab-panel p-4 rounded-xl bg-lab-900/90 border border-sky-900/40">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wide">
              3. Radius of Curvature (R)
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
              Lens Geometry
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
              Formula: <strong className="text-purple-300">R = (S · μ) / (4 · λ)</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Experimental Curvature R:</span>
              <span className="text-purple-400 font-bold">
                {airResults.experimentalRadius
                  ? `${airResults.experimentalRadius.toFixed(3)} m`
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Theoretical Curvature R:</span>
              <span className="text-slate-300 font-bold">{params.radiusCurvature.toFixed(2)} m</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Focal Length (f = R/(μₗ-1)):</span>
              <span className="text-slate-300 font-mono">
                {airResults.experimentalRadius
                  ? `${(airResults.experimentalRadius / (params.lensRefractiveIndex - 1)).toFixed(2)} m`
                  : '—'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Percentage Error:</span>
              <span className="font-bold text-slate-200">
                {airResults.radiusErrorPercent !== undefined
                  ? `${airResults.radiusErrorPercent.toFixed(2)} %`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Liquid Medium Refractive Index Determination */}
        <div className="lab-panel p-4 rounded-xl bg-lab-900/90 border border-cyan-900/40">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wide">
              4. Liquid Refractive Index (μ)
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              Medium Ratio
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
              Formula: <strong className="text-cyan-300">μ = S_air / S_liquid</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Air Slope (S_air):</span>
              <span className="text-slate-200">
                {liquidResults.airSlope > 0 ? `${liquidResults.airSlope.toFixed(4)}` : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Liquid Slope (S_liq):</span>
              <span className="text-slate-200">
                {liquidResults.liquidSlope > 0 ? `${liquidResults.liquidSlope.toFixed(4)}` : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Experimental μ_liquid:</span>
              <span className="text-cyan-400 font-bold">
                {expMu ? expMu.toFixed(3) : 'Record liquid data'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">True Value / Err:</span>
              <span className="font-bold text-slate-200">
                {expMu && muError !== undefined
                  ? `${params.mediumRefractiveIndex.toFixed(3)} (${muError.toFixed(2)}%)`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Measurement Uncertainty & Least Count Analysis */}
        <div className="lab-panel p-4 rounded-xl bg-lab-900/90 border border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wide">
              5. Uncertainty & Error Analysis
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              Precision
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Microscope Least Count:</span>
              <span className="text-slate-200 font-bold">0.01 mm</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Diameter Uncertainty (δD):</span>
              <span className="text-slate-200">± 0.014 mm</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Standard Error of Slope:</span>
              <span className="text-amber-400">
                {airResults.uncertainty > 0 ? `± ${airResults.uncertainty.toFixed(4)} mm²` : '—'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Regression Goodness (R²):</span>
              <span className="text-emerald-400 font-bold">{airRegression.r2.toFixed(4)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
              Fractional error in λ: δλ/λ ≈ 2·(δD/D) + δR/R
            </div>
          </div>
        </div>

        {/* Card 6: Ring Spacing & Thickness Scaling */}
        <div className="lab-panel p-4 rounded-xl bg-lab-900/90 border border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wide">
              6. Geometric Film Thickness (tₙ)
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              Optics
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Central Thickness (t₀):</span>
              <span className="text-slate-200">{params.lensDisplacement} nm</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>1st Dark Ring Thickness (t₁):</span>
              <span className="text-slate-200 font-bold">
                {((params.wavelength / (2 * params.mediumRefractiveIndex)) + params.lensDisplacement).toFixed(1)} nm
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>10th Dark Ring Thickness (t₁₀):</span>
              <span className="text-slate-200 font-bold">
                {(((10 * params.wavelength) / (2 * params.mediumRefractiveIndex)) + params.lensDisplacement).toFixed(1)} nm
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
              For consecutive dark rings, thickness increases in constant steps of λ/(2μ) = {(params.wavelength / (2 * params.mediumRefractiveIndex)).toFixed(1)} nm.
            </div>
          </div>
        </div>
      </div>

      {/* Pair Differences Breakdown Table (if available) */}
      {pairDifferences.length > 0 && (
        <div className="p-4 rounded-xl bg-lab-900/90 border border-slate-800">
          <h4 className="text-xs font-mono font-semibold text-slate-300 mb-3 flex items-center space-x-2">
            <Sigma className="w-4 h-4 text-emerald-400" />
            <span>INTERMEDIATE PAIR DIFFERENCE CALCULATIONS (INTERVAL m = 4)</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2 px-3">Ring Pair (n, n+m)</th>
                  <th className="py-2 px-3">D²ₙ (mm²)</th>
                  <th className="py-2 px-3">D²ₙ₊ₘ (mm²)</th>
                  <th className="py-2 px-3 text-emerald-400">ΔD² = D²ₙ₊ₘ - D²ₙ (mm²)</th>
                  <th className="py-2 px-3 text-sky-400">Calculated λ (nm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {pairDifferences.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-300 font-bold">
                      n={p.n} and n={p.npm}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{p.d2N.toFixed(4)}</td>
                    <td className="py-2 px-3 text-slate-400">{p.d2Npm.toFixed(4)}</td>
                    <td className="py-2 px-3 text-emerald-300 font-semibold">{p.diff.toFixed(4)}</td>
                    <td className="py-2 px-3 text-sky-300 font-bold">{p.calcLambda.toFixed(1)} nm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
