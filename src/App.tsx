import React, { useState, useCallback } from 'react';
import {
  OpticalParameters,
  TravellingMicroscopeState,
} from './types/physics';
import { Navbar } from './components/navigation/Navbar';
import { InterferenceCanvas } from './components/simulation/InterferenceCanvas';
import { SideViewOpticsCanvas } from './components/simulation/SideViewOpticsCanvas';
import { TravellingMicroscope } from './components/simulation/TravellingMicroscope';
import { SetupPanel } from './components/controls/SetupPanel';
import { GuidedDemosModal } from './components/controls/GuidedDemosModal';
import { Sun, Droplet, Layers, PanelRightOpen } from 'lucide-react';

const DEFAULT_PARAMS: OpticalParameters = {
  wavelength: 589, // Sodium D line
  wavelengthPreset: 'sodium',
  radiusCurvature: 1.0, // 1 meter
  lensDisplacement: 0, // In contact (0 nm)
  lensRefractiveIndex: 1.517, // Crown glass
  plateRefractiveIndex: 1.517,
  mediumRefractiveIndex: 1.0, // Air
  mediumPreset: 'air',
  lightMode: 'reflected',
  intensity: 0.95,
  contrast: 1.0,
  magnification: 1.0,
  hasIrregularity: false,
  irregularityType: 'gaussian_bump',
  irregularityMagnitude: 250,
  showRingMarkers: true,
  showCrosshairs: true,
};

const DEFAULT_MICROSCOPE: TravellingMicroscopeState = {
  positionX: 0.0,
  leastCount: 0.01,
  zeroError: 0.0,
  focus: 1.0,
  selectedRing: 4,
};

export function App() {
  const [params, setParams] = useState<OpticalParameters>(DEFAULT_PARAMS);
  const [microscope, setMicroscope] = useState<TravellingMicroscopeState>(DEFAULT_MICROSCOPE);
  const [viewMode, setViewMode] = useState<'top' | 'side'>('top');

  // Setup Sidebar Visibility (docked on right as a scroll menu)
  const [isSetupVisible, setIsSetupVisible] = useState<boolean>(true);
  const [isDemosOpen, setIsDemosOpen] = useState<boolean>(false);

  const handleUpdateParams = useCallback((update: Partial<OpticalParameters>) => {
    setParams((prev) => ({ ...prev, ...update }));
  }, []);

  const handleMicroscopeMove = useCallback((newPosX: number) => {
    setMicroscope((prev) => ({ ...prev, positionX: newPosX }));
  }, []);

  const handleUpdateMicroscope = useCallback((update: Partial<TravellingMicroscopeState>) => {
    setMicroscope((prev) => ({ ...prev, ...update }));
  }, []);

  const handleResetAll = () => {
    setParams(DEFAULT_PARAMS);
    setMicroscope(DEFAULT_MICROSCOPE);
    setViewMode('top');
  };

  return (
    <div className="w-full min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Edge-to-Edge Top Navigation Bar */}
      <Navbar
        isSetupVisible={isSetupVisible}
        onToggleSetup={() => setIsSetupVisible(!isSetupVisible)}
        onOpenDemosModal={() => setIsDemosOpen(true)}
        onResetAll={handleResetAll}
        params={params}
      />

      {/* Full Browser Page Stage */}
      <main className="flex-1 w-full px-4 sm:px-6 py-3 flex flex-col">
        <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 xl:gap-6 items-stretch">
          {/* Main Simulator Instrument Area (Expands to fill available space) */}
          <div className="flex-1 flex flex-col space-y-3 min-w-0">
            {/* Active Setup Parameters Status Strip */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-xl bg-lab-900/90 border border-slate-800 text-xs font-mono shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 text-[11px] font-semibold">APPARATUS:</span>

                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold border border-slate-700 flex items-center space-x-1">
                  <Sun className="w-3 h-3" />
                  <span>
                    {params.wavelengthPreset === 'white'
                      ? 'White Light'
                      : params.wavelengthPreset === 'sodium_doublet'
                      ? 'D₁/D₂ Beats'
                      : `${params.wavelength} nm`}
                  </span>
                </span>

                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold border border-slate-700 flex items-center space-x-1">
                  <Droplet className="w-3 h-3" />
                  <span>
                    {params.mediumPreset.toUpperCase()} (μ={params.mediumRefractiveIndex.toFixed(3)})
                  </span>
                </span>

                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-sky-300 font-semibold border border-slate-700 flex items-center space-x-1">
                  <Layers className="w-3 h-3" />
                  <span>R = {params.radiusCurvature.toFixed(2)} m</span>
                </span>

                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase text-[10px]">
                  {params.lightMode}
                </span>

                {params.lensDisplacement > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px]">
                    Lift: {params.lensDisplacement} nm
                  </span>
                )}
              </div>

              {!isSetupVisible && (
                <button
                  onClick={() => setIsSetupVisible(true)}
                  className="px-3 py-1 rounded-lg bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
                >
                  <PanelRightOpen className="w-3.5 h-3.5" />
                  <span>Show Setup Menu</span>
                </button>
              )}
            </div>

            {/* Central Eyepiece / Side-view Visualizer */}
            <div className="flex-1 flex justify-center items-center py-1">
              {viewMode === 'top' ? (
                <InterferenceCanvas
                  params={params}
                  microscope={microscope}
                  onMicroscopeMove={handleMicroscopeMove}
                  viewMode={viewMode}
                  onToggleViewMode={setViewMode}
                />
              ) : (
                <div className="space-y-2 w-full flex flex-col items-center">
                  <div className="flex justify-end w-full max-w-[640px]">
                    <button
                      onClick={() => setViewMode('top')}
                      className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs flex items-center space-x-1 transition-colors"
                    >
                      <span>Return to Rings View</span>
                    </button>
                  </div>
                  <SideViewOpticsCanvas params={params} />
                </div>
              )}
            </div>

            {/* High-Precision Travelling Microscope Controller */}
            <div className="shrink-0 w-full max-w-4xl mx-auto">
              <TravellingMicroscope
                microscope={microscope}
                params={params}
                onUpdateMicroscope={handleUpdateMicroscope}
                onRecordLeft={() => {}}
                onRecordRight={() => {}}
              />
            </div>
          </div>

          {/* Right Scrollable Setup Menu (Docked edge-to-edge on right) */}
          {isSetupVisible && (
            <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 h-full flex flex-col">
              <SetupPanel
                params={params}
                onChangeParams={handleUpdateParams}
                onResetToDefaults={() => setParams(DEFAULT_PARAMS)}
                onHide={() => setIsSetupVisible(false)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Guided Phenomena Demonstrations Modal */}
      <GuidedDemosModal
        isOpen={isDemosOpen}
        onClose={() => setIsDemosOpen(false)}
        params={params}
        onChangeParams={handleUpdateParams}
      />
    </div>
  );
}
export default App;
