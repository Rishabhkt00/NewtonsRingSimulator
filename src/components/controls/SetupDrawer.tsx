import React, { useState } from 'react';
import { OpticalParameters, WavelengthPreset, MediumPreset } from '../../types/physics';
import { wavelengthToRGB } from '../../physics/optics';
import {
  X,
  Sun,
  Droplet,
  Layers,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  params: OpticalParameters;
  onChangeParams: (update: Partial<OpticalParameters>) => void;
  onResetToDefaults: () => void;
}

export const SetupDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  params,
  onChangeParams,
  onResetToDefaults,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  if (!isOpen) return null;

  const [r, g, b] = wavelengthToRGB(params.wavelength);
  const wavelengthColor = `rgb(${r}, ${g}, ${b})`;

  const handleWavelengthPreset = (preset: WavelengthPreset) => {
    switch (preset) {
      case 'sodium':
        onChangeParams({ wavelengthPreset: preset, wavelength: 589 });
        break;
      case 'sodium_doublet':
        onChangeParams({ wavelengthPreset: preset, wavelength: 589.0, secondaryWavelength: 589.6 });
        break;
      case 'white':
        onChangeParams({ wavelengthPreset: preset });
        break;
      case 'red_filter':
        onChangeParams({ wavelengthPreset: preset, wavelength: 650 });
        break;
      case 'green_filter':
        onChangeParams({ wavelengthPreset: preset, wavelength: 532 });
        break;
      case 'violet_filter':
        onChangeParams({ wavelengthPreset: preset, wavelength: 405 });
        break;
      case 'blue_filter':
        onChangeParams({ wavelengthPreset: preset, wavelength: 450 });
        break;
      case 'custom':
        onChangeParams({ wavelengthPreset: preset });
        break;
    }
  };

  const handleMediumPreset = (medium: MediumPreset) => {
    switch (medium) {
      case 'air':
        onChangeParams({ mediumPreset: medium, mediumRefractiveIndex: 1.0 });
        break;
      case 'water':
        onChangeParams({ mediumPreset: medium, mediumRefractiveIndex: 1.333 });
        break;
      case 'oil':
        onChangeParams({ mediumPreset: medium, mediumRefractiveIndex: 1.516 });
        break;
      case 'custom':
        onChangeParams({ mediumPreset: medium });
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      {/* Drawer Container */}
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-lab-900/90 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-sm tracking-wide">
              APPARATUS CONFIGURATION
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onResetToDefaults}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              title="Reset parameters to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono select-none">
          {/* 1. Light Source */}
          <div className="p-3 rounded-xl bg-lab-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sky-400 flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Source & Wavelength</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow"
                  style={{
                    backgroundColor: params.wavelengthPreset === 'white' ? '#fff' : wavelengthColor,
                  }}
                />
                <span className="text-slate-300 font-bold">{params.wavelength} nm</span>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => handleWavelengthPreset('sodium')}
                className={`p-2 rounded-lg border text-left ${
                  params.wavelengthPreset === 'sodium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Sodium 589 nm
              </button>

              <button
                onClick={() => handleWavelengthPreset('sodium_doublet')}
                className={`p-2 rounded-lg border text-left ${
                  params.wavelengthPreset === 'sodium_doublet'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Sodium D₁/D₂ Beats
              </button>

              <button
                onClick={() => handleWavelengthPreset('white')}
                className={`p-2 rounded-lg border text-left ${
                  params.wavelengthPreset === 'white'
                    ? 'bg-white/20 text-white border-white/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                White Light (Dispersed)
              </button>

              <button
                onClick={() => handleWavelengthPreset('red_filter')}
                className={`p-2 rounded-lg border text-left ${
                  params.wavelengthPreset === 'red_filter'
                    ? 'bg-red-500/20 text-red-300 border-red-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Red (650 nm)
              </button>

              <button
                onClick={() => handleWavelengthPreset('green_filter')}
                className={`p-2 rounded-lg border text-left ${
                  params.wavelengthPreset === 'green_filter'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Green (532 nm)
              </button>

              <button
                onClick={() => handleWavelengthPreset('violet_filter')}
                className={`p-2 rounded-lg border text-left ${
                  params.wavelengthPreset === 'violet_filter'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Violet (405 nm)
              </button>
            </div>

            {/* Monochromatic Slider */}
            {params.wavelengthPreset !== 'white' && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                  <span>Custom Wavelength:</span>
                  <span className="text-sky-300 font-bold">{params.wavelength} nm</span>
                </div>
                <input
                  type="range"
                  min="380"
                  max="750"
                  step="1"
                  value={params.wavelength}
                  onChange={(e) =>
                    onChangeParams({
                      wavelength: parseInt(e.target.value),
                      wavelengthPreset: 'custom',
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>
            )}
          </div>

          {/* 2. Intervening Medium */}
          <div className="p-3 rounded-xl bg-lab-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-400 flex items-center space-x-1.5">
                <Droplet className="w-3.5 h-3.5" />
                <span>Intervening Medium (μ)</span>
              </span>
              <span className="text-cyan-300 font-bold">μ = {params.mediumRefractiveIndex.toFixed(3)}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                onClick={() => handleMediumPreset('air')}
                className={`p-1.5 rounded-lg border text-center ${
                  params.mediumPreset === 'air'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Air (1.000)
              </button>

              <button
                onClick={() => handleMediumPreset('water')}
                className={`p-1.5 rounded-lg border text-center ${
                  params.mediumPreset === 'water'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Water (1.333)
              </button>

              <button
                onClick={() => handleMediumPreset('oil')}
                className={`p-1.5 rounded-lg border text-center ${
                  params.mediumPreset === 'oil'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Oil (1.516)
              </button>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                <span>Adjust Index (μ):</span>
                <span className="text-cyan-300 font-bold">{params.mediumRefractiveIndex.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="1.000"
                max="1.700"
                step="0.005"
                value={params.mediumRefractiveIndex}
                onChange={(e) =>
                  onChangeParams({
                    mediumRefractiveIndex: parseFloat(e.target.value),
                    mediumPreset: 'custom',
                  })
                }
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* 3. Lens & Geometry */}
          <div className="p-3 rounded-xl bg-lab-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sky-400 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Lens Geometry & Displacement</span>
              </span>
              <span className="text-sky-300 font-bold">R = {params.radiusCurvature.toFixed(2)} m</span>
            </div>

            {/* Radius Curvature */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                <span>Radius of Curvature (R):</span>
                <span className="text-sky-300 font-bold">{params.radiusCurvature.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={params.radiusCurvature}
                onChange={(e) => onChangeParams({ radiusCurvature: parseFloat(e.target.value) })}
                className="w-full accent-sky-400"
              />
            </div>

            {/* Lens Vertical Displacement */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                <span>Lens Lift (d₀):</span>
                <span className="text-amber-300 font-bold">{params.lensDisplacement} nm</span>
              </div>
              <input
                type="range"
                min="0"
                max="1200"
                step="5"
                value={params.lensDisplacement}
                onChange={(e) => onChangeParams({ lensDisplacement: parseInt(e.target.value) })}
                className="w-full accent-amber-400"
              />
              <div className="flex items-center space-x-1.5 mt-1.5">
                <button
                  onClick={() => onChangeParams({ lensDisplacement: 0 })}
                  className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]"
                >
                  Contact (0)
                </button>
                <button
                  onClick={() => onChangeParams({ lensDisplacement: Math.round(params.wavelength / 4) })}
                  className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px] font-bold"
                  title="Lift by lambda/4 turns center bright!"
                >
                  λ/4 ({Math.round(params.wavelength / 4)} nm)
                </button>
                <button
                  onClick={() => onChangeParams({ lensDisplacement: Math.round(params.wavelength / 2) })}
                  className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]"
                >
                  λ/2
                </button>
              </div>
            </div>
          </div>

          {/* 4. Observation & Illumination Mode */}
          <div className="p-3 rounded-xl bg-lab-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Illumination & Optics</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => onChangeParams({ lightMode: 'reflected' })}
                className={`p-2 rounded-lg border text-center ${
                  params.lightMode === 'reflected'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Reflected Light (Dark Center)
              </button>

              <button
                onClick={() => onChangeParams({ lightMode: 'transmitted' })}
                className={`p-2 rounded-lg border text-center ${
                  params.lightMode === 'transmitted'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Transmitted Light (Bright Center)
              </button>
            </div>

            {/* Magnification */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                <span>Microscope Zoom:</span>
                <span className="text-sky-300 font-bold">{params.magnification.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="3.0"
                step="0.1"
                value={params.magnification}
                onChange={(e) => onChangeParams({ magnification: parseFloat(e.target.value) })}
                className="w-full accent-sky-400"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-300">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.showRingMarkers}
                  onChange={(e) => onChangeParams({ showRingMarkers: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-sky-500"
                />
                <span>Show Ring Tags</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.showCrosshairs}
                  onChange={(e) => onChangeParams({ showCrosshairs: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-sky-500"
                />
                <span>Show Crosswire</span>
              </label>
            </div>
          </div>


        </div>

        {/* Footer Done Button */}
        <div className="p-4 border-t border-slate-800 bg-lab-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-semibold rounded-lg shadow"
          >
            Apply & Close Setup
          </button>
        </div>
      </div>
    </div>
  );
};
