import React, { useState } from 'react';
import { OpticalParameters, WavelengthPreset, MediumPreset } from '../../types/physics';
import { wavelengthToRGB } from '../../physics/optics';
import {
  Sun,
  Droplet,
  Layers,
  Eye,
  Sliders,
  RotateCcw,
  PanelRightClose,
} from 'lucide-react';

interface Props {
  params: OpticalParameters;
  onChangeParams: (update: Partial<OpticalParameters>) => void;
  onResetToDefaults: () => void;
  onHide: () => void;
}

export const SetupPanel: React.FC<Props> = ({
  params,
  onChangeParams,
  onResetToDefaults,
  onHide,
}) => {
  const [r, g, b] = wavelengthToRGB(params.wavelength);
  const wavelengthColor = `rgb(${r}, ${g}, ${b})`;

  const handleWavelengthPreset = (preset: WavelengthPreset) => {
    switch (preset) {
      case 'sodium':
        onChangeParams({ wavelengthPreset: preset, wavelength: 589 });
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
      case 'sodium_doublet':
        onChangeParams({ wavelengthPreset: preset, wavelength: 589.0, secondaryWavelength: 589.6 });
        break;
      case 'white':
        onChangeParams({ wavelengthPreset: preset });
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
    <div className="w-full h-full lab-panel bg-lab-900/95 border border-slate-800 rounded-2xl flex flex-col shadow-2xl font-mono text-xs select-none overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-lab-950/80 shrink-0">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h3 className="font-bold text-slate-100 text-xs tracking-wide">
            APPARATUS SETUP
          </h3>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onResetToDefaults}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Reset parameters to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onHide}
            className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center space-x-1 text-[11px] border border-slate-700"
            title="Hide Setup Menu"
          >
            <span>Hide</span>
            <PanelRightClose className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Scrollable Setup Options */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* 1. Light Source */}
        <div className="p-3.5 rounded-xl bg-lab-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-bold text-sky-400 flex items-center space-x-1.5 text-[11px]">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light Source & λ</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <div
                className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow"
                style={{
                  backgroundColor: params.wavelengthPreset === 'white' ? '#fff' : wavelengthColor,
                }}
              />
              <span className="text-slate-300 font-bold text-[11px]">{params.wavelength} nm</span>
            </div>
          </div>

          {/* Color Presets including Red and Violet */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              onClick={() => handleWavelengthPreset('sodium')}
              className={`p-2 rounded-lg border text-left ${
                params.wavelengthPreset === 'sodium'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Sodium (589 nm)
            </button>

            <button
              onClick={() => handleWavelengthPreset('red_filter')}
              className={`p-2 rounded-lg border text-left ${
                params.wavelengthPreset === 'red_filter'
                  ? 'bg-red-500/20 text-red-300 border-red-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Red (650 nm)
            </button>

            <button
              onClick={() => handleWavelengthPreset('green_filter')}
              className={`p-2 rounded-lg border text-left ${
                params.wavelengthPreset === 'green_filter'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Green (532 nm)
            </button>

            <button
              onClick={() => handleWavelengthPreset('violet_filter')}
              className={`p-2 rounded-lg border text-left ${
                params.wavelengthPreset === 'violet_filter'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Violet (405 nm)
            </button>

            <button
              onClick={() => handleWavelengthPreset('white')}
              className={`p-2 rounded-lg border text-left ${
                params.wavelengthPreset === 'white'
                  ? 'bg-white/20 text-white border-white/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              White Light
            </button>

            <button
              onClick={() => handleWavelengthPreset('sodium_doublet')}
              className={`p-2 rounded-lg border text-left ${
                params.wavelengthPreset === 'sodium_doublet'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              D₁/D₂ Beats
            </button>
          </div>

          {params.wavelengthPreset !== 'white' && (
            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[10px]">
                <span>Continuous Wavelength Slider:</span>
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
        <div className="p-3.5 rounded-xl bg-lab-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-bold text-cyan-400 flex items-center space-x-1.5 text-[11px]">
              <Droplet className="w-3.5 h-3.5" />
              <span>Intervening Medium (μ)</span>
            </span>
            <span className="text-cyan-300 font-bold text-[11px]">μ = {params.mediumRefractiveIndex.toFixed(3)}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => handleMediumPreset('air')}
              className={`p-2 rounded border text-center ${
                params.mediumPreset === 'air'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Air (1.000)
            </button>

            <button
              onClick={() => handleMediumPreset('water')}
              className={`p-2 rounded border text-center ${
                params.mediumPreset === 'water'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Water (1.333)
            </button>

            <button
              onClick={() => handleMediumPreset('oil')}
              className={`p-2 rounded border text-center ${
                params.mediumPreset === 'oil'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Oil (1.516)
            </button>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[10px]">
              <span>Refractive Index (μ):</span>
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
        <div className="p-3.5 rounded-xl bg-lab-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-bold text-sky-400 flex items-center space-x-1.5 text-[11px]">
              <Layers className="w-3.5 h-3.5" />
              <span>Lens Curvature & Lift</span>
            </span>
            <span className="text-sky-300 font-bold text-[11px]">R = {params.radiusCurvature.toFixed(2)} m</span>
          </div>

          {/* Curvature */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[10px]">
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

          {/* Lens Displacement */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[10px]">
              <span>Lens Vertical Lift (d₀):</span>
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
            <div className="flex items-center space-x-2 mt-1.5">
              <button
                onClick={() => onChangeParams({ lensDisplacement: 0 })}
                className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] hover:text-slate-200"
              >
                Contact (0)
              </button>
              <button
                onClick={() => onChangeParams({ lensDisplacement: Math.round(params.wavelength / 4) })}
                className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px] font-bold"
                title="Lift by lambda/4 turns center bright!"
              >
                λ/4 ({Math.round(params.wavelength / 4)} nm)
              </button>
              <button
                onClick={() => onChangeParams({ lensDisplacement: Math.round(params.wavelength / 2) })}
                className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] hover:text-slate-200"
              >
                λ/2
              </button>
            </div>
          </div>
        </div>

        {/* 4. Illumination Mode & Zoom */}
        <div className="p-3.5 rounded-xl bg-lab-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-bold text-emerald-400 flex items-center space-x-1.5 text-[11px]">
              <Eye className="w-3.5 h-3.5" />
              <span>Illumination & View</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              onClick={() => onChangeParams({ lightMode: 'reflected' })}
              className={`p-2 rounded border text-center ${
                params.lightMode === 'reflected'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Reflected (Dark Center)
            </button>

            <button
              onClick={() => onChangeParams({ lightMode: 'transmitted' })}
              className={`p-2 rounded border text-center ${
                params.lightMode === 'transmitted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Transmitted (Bright Center)
            </button>
          </div>

          {/* Zoom */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[10px]">
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

          {/* Toggles */}
          <div className="flex items-center space-x-3 pt-1 text-[10px] text-slate-300">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={params.showRingMarkers}
                onChange={(e) => onChangeParams({ showRingMarkers: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-sky-500"
              />
              <span>Ring Tags</span>
            </label>

            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={params.showCrosshairs}
                onChange={(e) => onChangeParams({ showCrosshairs: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-sky-500"
              />
              <span>Crosswire</span>
            </label>
          </div>
        </div>


      </div>
    </div>
  );
};
