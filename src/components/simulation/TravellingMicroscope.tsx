import React, { useState } from 'react';
import { TravellingMicroscopeState, OpticalParameters } from '../../types/physics';
import { getTheoreticalRingDiameterMm } from '../../physics/optics';
import { RotateCcw, Compass, Settings2 } from 'lucide-react';

interface Props {
  microscope: TravellingMicroscopeState;
  params: OpticalParameters;
  onUpdateMicroscope: (update: Partial<TravellingMicroscopeState>) => void;
}

export const TravellingMicroscope: React.FC<Props> = ({
  microscope,
  params,
  onUpdateMicroscope,
}) => {
  const [selectedRing, setSelectedRing] = useState<number>(4);
  const [ringType, setRingType] = useState<'dark' | 'bright'>('dark');
  const [showCalibration, setShowCalibration] = useState<boolean>(false);

  const currentPos = microscope.positionX;
  const lc = microscope.leastCount;
  const zeroErr = microscope.zeroError;

  const railCenterMm = 25.00;
  const actualRailPosMm = railCenterMm + currentPos;
  const correctedRailPosMm = actualRailPosMm - zeroErr;

  const msr = Math.floor(correctedRailPosMm);
  const fractionMm = correctedRailPosMm - msr;
  const vsr = Math.round(fractionMm / lc);
  const totalReadingMm = Number((msr + vsr * lc).toFixed(3));

  const moveBy = (deltaMm: number) => {
    const nextPos = Math.max(-6.5, Math.min(6.5, currentPos + deltaMm));
    const snapped = Math.round(nextPos / lc) * lc;
    onUpdateMicroscope({ positionX: Number(snapped.toFixed(3)) });
  };

  const alignToRing = (n: number, side: 'left' | 'right') => {
    const diam = getTheoreticalRingDiameterMm(n, params, ringType === 'dark');
    const radius = diam / 2;
    const targetX = side === 'left' ? -radius : radius;
    const clamped = Math.max(-6.5, Math.min(6.5, targetX));
    const snapped = Math.round(clamped / lc) * lc;
    onUpdateMicroscope({ positionX: Number(snapped.toFixed(3)) });
  };

  // Live measurement: the crosswire's own distance from the optical centre.
  // Radius r = |crosswire offset|, so the diameter of the circle it sits on is D = 2r.
  const radiusMm = Math.abs(currentPos);
  const diameterMm = 2 * radiusMm;
  const diameterSqMm2 = diameterMm * diameterMm;

  return (
    <div className="w-full lab-panel p-3.5 rounded-xl border border-sky-900/40 bg-lab-900/90 shadow-xl space-y-3">
      {/* Top Header & Readout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Title & Calibration Toggle */}
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200 text-xs tracking-wide font-mono">
            TRAVELLING MICROSCOPE
          </span>
          <button
            onClick={() => setShowCalibration(!showCalibration)}
            className={`p-1 rounded text-xs border transition-colors ${
              showCalibration
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                : 'text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title="Microscope Least Count & Zero Error"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Digital Vernier Counter */}
        <div className="flex items-center space-x-3 bg-lab-950 px-3 py-1.5 rounded-lg border border-sky-500/30 font-mono text-xs shadow-inner">
          <span className="text-slate-400">Total Reading:</span>
          <span className="text-sm font-bold text-sky-400">
            {totalReadingMm.toFixed(2)} mm
          </span>
          <span className="text-slate-500 text-[10px]">
            [MSR: {msr}mm + VSR: {vsr}div]
          </span>
        </div>

        {/* Center Reset */}
        <button
          onClick={() => onUpdateMicroscope({ positionX: 0.0 })}
          className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Center (0.00mm)</span>
        </button>
      </div>

      {/* Calibration Popup */}
      {showCalibration && (
        <div className="p-2.5 rounded-lg bg-lab-950 border border-slate-800 grid grid-cols-2 gap-3 text-[11px] font-mono text-slate-300">
          <div>
            <span className="text-slate-400 block mb-1">Least Count:</span>
            <div className="flex space-x-1">
              {[0.01, 0.005, 0.02].map((val) => (
                <button
                  key={val}
                  onClick={() => onUpdateMicroscope({ leastCount: val })}
                  className={`px-2 py-0.5 rounded border ${
                    lc === val
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                      : 'bg-slate-850 text-slate-400 border-slate-700'
                  }`}
                >
                  {val} mm
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>Zero Error:</span>
              <span className="text-amber-300">{zeroErr.toFixed(3)} mm</span>
            </div>
            <input
              type="range"
              min="-0.10"
              max="0.10"
              step="0.005"
              value={zeroErr}
              onChange={(e) => onUpdateMicroscope({ zeroError: parseFloat(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      )}

      {/* Horizontal Micrometer Motion & Nudge Steppers */}
      <div className="space-y-1.5 font-mono">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span>Crosswire Position:</span>
          <span className="text-sky-300 font-bold">
            {currentPos >= 0 ? '+' : ''}{currentPos.toFixed(2)} mm
          </span>
        </div>

        <input
          type="range"
          min="-6.5"
          max="6.5"
          step={lc}
          value={currentPos}
          onChange={(e) => onUpdateMicroscope({ positionX: parseFloat(e.target.value) })}
          className="w-full accent-sky-400 cursor-pointer"
        />

        <div className="flex items-center justify-between gap-1 pt-1">
          <button
            onClick={() => moveBy(-1.0)}
            className="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
          >
            -1mm
          </button>
          <button
            onClick={() => moveBy(-0.1)}
            className="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
          >
            -0.1
          </button>
          <button
            onClick={() => moveBy(-0.01)}
            className="flex-1 py-1 px-1 rounded bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 text-[11px] border border-sky-800/60 font-bold"
          >
            -0.01
          </button>
          <button
            onClick={() => moveBy(0.01)}
            className="flex-1 py-1 px-1 rounded bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 text-[11px] border border-sky-800/60 font-bold"
          >
            +0.01
          </button>
          <button
            onClick={() => moveBy(0.1)}
            className="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
          >
            +0.1
          </button>
          <button
            onClick={() => moveBy(1.0)}
            className="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700"
          >
            +1mm
          </button>
        </div>
      </div>

      {/* Measurement Dock */}
      <div className="p-2.5 rounded-lg bg-lab-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 font-mono text-xs">
        {/* Ring target & quick snap */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Target Ring:</span>
          <div className="flex rounded-full bg-slate-900 p-0.5">
            {(['dark', 'bright'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRingType(t)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize transition-colors ${
                  ringType === t
                    ? t === 'dark'
                      ? 'bg-sky-400 text-black'
                      : 'bg-slate-50 text-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select
            value={selectedRing}
            onChange={(e) => setSelectedRing(parseInt(e.target.value))}
            className="bg-slate-900 border border-sky-500/40 text-sky-300 font-bold px-2 py-1 rounded outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16].map((n) => (
              <option key={n} value={n}>
                {ringType === 'dark' ? 'Dark' : 'Bright'} ring n = {n}
              </option>
            ))}
          </select>

          <button
            onClick={() => alignToRing(selectedRing, 'left')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] border border-slate-700"
            title="Snap to left of ring"
          >
            Snap L
          </button>

          <button
            onClick={() => alignToRing(selectedRing, 'right')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] border border-slate-700"
            title="Snap to right of ring"
          >
            Snap R
          </button>
        </div>

        {/* Live crosswire diameter readout (distance from the centre, not tied to any ring) */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
          <div
            className="px-2.5 py-1 rounded border border-slate-700 bg-slate-900 text-slate-300 text-[11px] font-semibold"
            title="Crosswire distance from the optical centre"
          >
            r = {radiusMm.toFixed(2)} mm
          </div>

          <div
            className="px-3 py-1 rounded bg-lab-900 border border-sky-500/40 text-sky-300 font-bold text-[12px] flex items-center space-x-2"
            title="Diameter of the circle through the crosswire: D = 2r"
          >
            <span>D = {diameterMm.toFixed(2)} mm</span>
            <span className="text-sky-300/60 text-[11px] font-semibold">
              (D² = {diameterSqMm2.toFixed(2)} mm²)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
