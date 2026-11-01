import React, { useState } from 'react';
import { OpticalParameters, WavelengthPreset, MediumPreset, IrregularityType } from '../../types/physics';
import { wavelengthToRGB } from '../../physics/optics';
import {
  Sun,
  Layers,
  Droplet,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Eye,
  Activity,
  Compass,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  params: OpticalParameters;
  onChangeParams: (update: Partial<OpticalParameters>) => void;
  onResetToDefaults: () => void;
}

export const ParameterControls: React.FC<Props> = ({
  params,
  onChangeParams,
  onResetToDefaults,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [r, g, b] = wavelengthToRGB(params.wavelength);
  const wavelengthColor = `rgb(${r}, ${g}, ${b})`;

  // Preset handlers
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

  // Quick Guided Demonstrations
  const applyDemonstration = (demoKey: string) => {
    switch (demoKey) {
      case 'lambda_quarter':
        // Raises lens by lambda/4 -> switches central spot from dark to bright!
        const lQuarter = Math.round(params.wavelength / 4);
        onChangeParams({
          lensDisplacement: lQuarter,
          lightMode: 'reflected',
          hasIrregularity: false,
        });
        break;
      case 'transmitted':
        // Complementary transmitted light
        onChangeParams({
          lightMode: params.lightMode === 'reflected' ? 'transmitted' : 'reflected',
        });
        break;
      case 'white_light':
        // White light dispersion
        onChangeParams({
          wavelengthPreset: 'white',
          lensDisplacement: 0,
          hasIrregularity: false,
        });
        break;
      case 'sodium_doublet':
        // Doublet beats
        onChangeParams({
          wavelengthPreset: 'sodium_doublet',
          wavelength: 589.0,
          secondaryWavelength: 589.6,
        });
        break;
      case 'flatness_test':
        // Surface irregularity
        onChangeParams({
          hasIrregularity: true,
          irregularityType: 'gaussian_bump',
          irregularityMagnitude: 250,
        });
        break;
      case 'liquid_water':
        // Liquid film
        onChangeParams({
          mediumPreset: 'water',
          mediumRefractiveIndex: 1.333,
        });
        break;
    }
  };

  return (
    <div className="w-full space-y-4 text-xs select-none">
      {/* 1. Light Source Section */}
      <div className="lab-panel p-3.5 bg-lab-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400 font-semibold tracking-wide">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>LIGHT SOURCE & WAVELENGTH</span>
          </div>

          {/* Color swatch */}
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full border border-slate-600 shadow-md transition-colors"
              style={{
                backgroundColor: params.wavelengthPreset === 'white' ? '#ffffff' : wavelengthColor,
                boxShadow: `0 0 10px ${params.wavelengthPreset === 'white' ? '#ffffff' : wavelengthColor}`,
              }}
            />
            <span className="font-mono text-slate-300 font-bold">
              {params.wavelengthPreset === 'white'
                ? 'White Spectrum'
                : params.wavelengthPreset === 'sodium_doublet'
                ? '589.0 & 589.6 nm'
                : `${params.wavelength} nm`}
            </span>
          </div>
        </div>

        {/* Source Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3 font-mono">
          <button
            onClick={() => handleWavelengthPreset('sodium')}
            className={`py-1.5 px-2 rounded-lg border text-left flex items-center justify-between ${
              params.wavelengthPreset === 'sodium'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <span>Sodium Monochromatic</span>
            <span className="text-[10px] text-amber-400 font-bold">589 nm</span>
          </button>

          <button
            onClick={() => handleWavelengthPreset('sodium_doublet')}
            className={`py-1.5 px-2 rounded-lg border text-left flex items-center justify-between ${
              params.wavelengthPreset === 'sodium_doublet'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <span>Sodium D₁/D₂ Doublet</span>
            <span className="text-[10px] text-amber-400 font-bold">Beats</span>
          </button>

          <button
            onClick={() => handleWavelengthPreset('white')}
            className={`py-1.5 px-2 rounded-lg border text-left flex items-center justify-between ${
              params.wavelengthPreset === 'white'
                ? 'bg-white/20 text-white border-white/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <span>White Light</span>
            <span className="text-[10px] text-sky-300 font-bold">Polychromatic</span>
          </button>

          <button
            onClick={() => handleWavelengthPreset('red_filter')}
            className={`py-1.5 px-2 rounded-lg border text-left flex items-center justify-between ${
              params.wavelengthPreset === 'red_filter'
                ? 'bg-red-500/20 text-red-300 border-red-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <span>Red Filter</span>
            <span className="text-[10px] text-red-400 font-bold">650 nm</span>
          </button>

          <button
            onClick={() => handleWavelengthPreset('green_filter')}
            className={`py-1.5 px-2 rounded-lg border text-left flex items-center justify-between ${
              params.wavelengthPreset === 'green_filter'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <span>Green Filter</span>
            <span className="text-[10px] text-emerald-400 font-bold">532 nm</span>
          </button>

          <button
            onClick={() => handleWavelengthPreset('blue_filter')}
            className={`py-1.5 px-2 rounded-lg border text-left flex items-center justify-between ${
              params.wavelengthPreset === 'blue_filter'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <span>Blue Filter</span>
            <span className="text-[10px] text-blue-400 font-bold">450 nm</span>
          </button>
        </div>

        {/* Custom Wavelength Slider */}
        {params.wavelengthPreset !== 'white' && (
          <div className="mb-2">
            <div className="flex justify-between text-slate-400 font-mono mb-1">
              <span>Monochromatic Wavelength (λ):</span>
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
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>380 nm (Violet)</span>
              <span>550 nm (Green)</span>
              <span>750 nm (Red)</span>
            </div>
          </div>
        )}

        {/* Source Intensity Slider */}
        <div>
          <div className="flex justify-between text-slate-400 font-mono mb-1">
            <span>Light Intensity (I₀):</span>
            <span className="text-sky-300 font-bold">{Math.round(params.intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={params.intensity}
            onChange={(e) => onChangeParams({ intensity: parseFloat(e.target.value) })}
            className="w-full accent-sky-400"
          />
        </div>
      </div>

      {/* 2. Intervening Medium Section */}
      <div className="lab-panel p-3.5 bg-lab-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400 font-semibold tracking-wide">
            <Droplet className="w-4 h-4 text-cyan-400" />
            <span>INTERVENING MEDIUM</span>
          </div>

          <div className="font-mono text-cyan-300 font-bold">
            μ = {params.mediumRefractiveIndex.toFixed(3)}
          </div>
        </div>

        {/* Medium Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3 font-mono">
          <button
            onClick={() => handleMediumPreset('air')}
            className={`py-1.5 px-2 rounded-lg border text-center ${
              params.mediumPreset === 'air'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <div>Air Film</div>
            <div className="text-[10px] text-slate-400">μ = 1.000</div>
          </button>

          <button
            onClick={() => handleMediumPreset('water')}
            className={`py-1.5 px-2 rounded-lg border text-center ${
              params.mediumPreset === 'water'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <div>Water</div>
            <div className="text-[10px] text-slate-400">μ = 1.333</div>
          </button>

          <button
            onClick={() => handleMediumPreset('oil')}
            className={`py-1.5 px-2 rounded-lg border text-center ${
              params.mediumPreset === 'oil'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <div>Oil</div>
            <div className="text-[10px] text-slate-400">μ = 1.516</div>
          </button>

          <button
            onClick={() => handleMediumPreset('custom')}
            className={`py-1.5 px-2 rounded-lg border text-center ${
              params.mediumPreset === 'custom'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <div>Custom Liquid</div>
            <div className="text-[10px] text-slate-400">Adjustable</div>
          </button>
        </div>

        {/* Refractive Index Slider */}
        <div>
          <div className="flex justify-between text-slate-400 font-mono mb-1">
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
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
            <span>1.000 (Air)</span>
            <span>1.333 (Water)</span>
            <span>1.516 (Oil)</span>
            <span>1.700 (Dense)</span>
          </div>
        </div>
      </div>

      {/* 3. Lens & Geometry Section */}
      <div className="lab-panel p-3.5 bg-lab-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400 font-semibold tracking-wide">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>LENS & OPTICAL ARRANGEMENT</span>
          </div>

          <div className="font-mono text-sky-300 font-bold">
            R = {params.radiusCurvature.toFixed(2)} m
          </div>
        </div>

        {/* Radius of Curvature Slider */}
        <div className="mb-3">
          <div className="flex justify-between text-slate-400 font-mono mb-1">
            <span>Lens Radius of Curvature (R):</span>
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
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
            <span>0.5 m (Tighter rings)</span>
            <span>1.0 m (Standard)</span>
            <span>3.0 m (Wider rings)</span>
          </div>
        </div>

        {/* Vertical Lens Displacement Slider (d0) */}
        <div>
          <div className="flex justify-between items-center text-slate-400 font-mono mb-1">
            <span>Lens Vertical Displacement (d₀):</span>
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

          {/* Quick displacement buttons */}
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="text-[10px] text-slate-500 font-mono">Displace:</span>
            <button
              onClick={() => onChangeParams({ lensDisplacement: 0 })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                params.lensDisplacement === 0
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              0 (Contact)
            </button>
            <button
              onClick={() => onChangeParams({ lensDisplacement: Math.round(params.wavelength / 4) })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                params.lensDisplacement === Math.round(params.wavelength / 4)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Displacement of lambda/4 causes central spot to turn bright!"
            >
              λ/4 ({Math.round(params.wavelength / 4)} nm)
            </button>
            <button
              onClick={() => onChangeParams({ lensDisplacement: Math.round(params.wavelength / 2) })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                params.lensDisplacement === Math.round(params.wavelength / 2)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              λ/2 ({Math.round(params.wavelength / 2)} nm)
            </button>
            <button
              onClick={() => onChangeParams({ lensDisplacement: Math.round((3 * params.wavelength) / 4) })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                params.lensDisplacement === Math.round((3 * params.wavelength) / 4)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              3λ/4
            </button>
            <button
              onClick={() => onChangeParams({ lensDisplacement: params.wavelength })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                params.lensDisplacement === params.wavelength
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              1λ
            </button>
          </div>
        </div>
      </div>

      {/* 4. Observation & View Settings */}
      <div className="lab-panel p-3.5 bg-lab-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sky-400 font-semibold tracking-wide">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>OBSERVATION & INTERFEROMETRY SETTINGS</span>
          </div>
        </div>

        {/* Reflected vs Transmitted Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-3 font-mono">
          <button
            onClick={() => onChangeParams({ lightMode: 'reflected' })}
            className={`py-2 px-3 rounded-lg border text-center transition-all ${
              params.lightMode === 'reflected'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/60 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <div>Reflected Light</div>
            <div className="text-[10px] text-slate-400">Dark central spot (t=0)</div>
          </button>

          <button
            onClick={() => onChangeParams({ lightMode: 'transmitted' })}
            className={`py-2 px-3 rounded-lg border text-center transition-all ${
              params.lightMode === 'transmitted'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold shadow-md'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <div>Transmitted Light</div>
            <div className="text-[10px] text-slate-400">Bright central spot (t=0)</div>
          </button>
        </div>

        {/* Magnification & Contrast */}
        <div className="grid grid-cols-2 gap-3 mb-2 font-mono">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Zoom Magnification:</span>
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

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Fringe Contrast:</span>
              <span className="text-sky-300 font-bold">{params.contrast.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={params.contrast}
              onChange={(e) => onChangeParams({ contrast: parseFloat(e.target.value) })}
              className="w-full accent-sky-400"
            />
          </div>
        </div>

        {/* Checkbox toggles */}
        <div className="flex items-center space-x-4 pt-1 font-mono text-[11px] text-slate-300">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.showRingMarkers}
              onChange={(e) => onChangeParams({ showRingMarkers: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Show Ring Order (n) Tags</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.showCrosshairs}
              onChange={(e) => onChangeParams({ showCrosshairs: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Show Crosswires</span>
          </label>
        </div>
      </div>

      {/* 5. Collapsible Advanced Settings (Optical Flatness & Material Properties) */}
      <div className="lab-panel bg-lab-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-3 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="font-semibold tracking-wide">ADVANCED OPTICAL SETTINGS & SURFACE FLATNESS</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-3.5 pt-0 border-t border-slate-800 space-y-3 font-mono">
            {/* Optical Flatness Demonstration */}
            <div className="p-2.5 rounded-lg bg-lab-950 border border-purple-950/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">Optical Surface Flatness Testing:</span>
                <button
                  onClick={() => onChangeParams({ hasIrregularity: !params.hasIrregularity })}
                  className={`px-2.5 py-1 rounded text-xs border ${
                    params.hasIrregularity
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  }`}
                >
                  {params.hasIrregularity ? 'Surface Defect Active' : 'Perfect Optical Flat'}
                </button>
              </div>

              {params.hasIrregularity && (
                <div className="space-y-2 mt-2 pt-2 border-t border-slate-800">
                  <div className="flex space-x-2">
                    {(['gaussian_bump', 'tilt', 'undulation'] as IrregularityType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => onChangeParams({ irregularityType: t })}
                        className={`flex-1 py-1 px-1.5 rounded text-[10px] border capitalize ${
                          params.irregularityType === t
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span>Defect Height:</span>
                      <span className="text-purple-300">{params.irregularityMagnitude} nm</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="600"
                      step="25"
                      value={params.irregularityMagnitude}
                      onChange={(e) => onChangeParams({ irregularityMagnitude: parseInt(e.target.value) })}
                      className="w-full accent-purple-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Substrate Refractive Indices */}
            <div className="grid grid-cols-2 gap-3 text-slate-400 text-[11px]">
              <div>
                <span>Plano-convex Lens (μ_lens):</span>
                <input
                  type="number"
                  step="0.005"
                  value={params.lensRefractiveIndex}
                  onChange={(e) => onChangeParams({ lensRefractiveIndex: parseFloat(e.target.value) || 1.5 })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
              </div>

              <div>
                <span>Glass Plate (μ_plate):</span>
                <input
                  type="number"
                  step="0.005"
                  value={params.plateRefractiveIndex}
                  onChange={(e) => onChangeParams({ plateRefractiveIndex: parseFloat(e.target.value) || 1.5 })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Guided Physics Demonstrations Quick Tour Bar */}
      <div className="lab-panel p-3 bg-lab-900/90 border border-sky-950/60 rounded-xl">
        <div className="flex items-center space-x-2 text-sky-400 font-semibold mb-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>GUIDED PHENOMENA DEMONSTRATIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => applyDemonstration('lambda_quarter')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left"
          >
            <div className="font-semibold text-sky-300">Lift Lens by λ/4</div>
            <div className="text-[10px] text-slate-400">Dark spot turns bright</div>
          </button>

          <button
            onClick={() => applyDemonstration('transmitted')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left"
          >
            <div className="font-semibold text-emerald-300">Complementary Transmitted</div>
            <div className="text-[10px] text-slate-400">Interchange bright & dark</div>
          </button>

          <button
            onClick={() => applyDemonstration('white_light')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left"
          >
            <div className="font-semibold text-white">White Light Dispersion</div>
            <div className="text-[10px] text-slate-400">Colored rings & washout</div>
          </button>

          <button
            onClick={() => applyDemonstration('sodium_doublet')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left"
          >
            <div className="font-semibold text-amber-300">Sodium D₁/D₂ Doublet</div>
            <div className="text-[10px] text-slate-400">Contrast modulation beats</div>
          </button>

          <button
            onClick={() => applyDemonstration('liquid_water')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left"
          >
            <div className="font-semibold text-cyan-300">Introduce Liquid (μ)</div>
            <div className="text-[10px] text-slate-400">Rings shrink by 1/√μ</div>
          </button>

          <button
            onClick={() => applyDemonstration('flatness_test')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left"
          >
            <div className="font-semibold text-purple-300">Optical Flatness Test</div>
            <div className="text-[10px] text-slate-400">Fringe contour distortion</div>
          </button>
        </div>
      </div>
    </div>
  );
};
