import React from 'react';
import { OpticalParameters } from '../../types/physics';
import { RotateCcw, Settings, Sparkles, PanelRightClose, ArrowUpRight } from 'lucide-react';

interface Props {
  isSetupVisible: boolean;
  onToggleSetup: () => void;
  onOpenDemosModal: () => void;
  onResetAll: () => void;
  params: OpticalParameters;
}

export const Navbar: React.FC<Props> = ({
  isSetupVisible,
  onToggleSetup,
  onOpenDemosModal,
  onResetAll,
  params,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/90 backdrop-blur-md select-none">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-mono text-[12px] tracking-[0.28em] uppercase text-slate-300">
              Newton's Rings Lab
            </span>
            <span className="pill hidden md:inline-flex">
              {params.wavelengthPreset === 'white' ? 'White light' : `${params.wavelength} nm`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button onClick={onOpenDemosModal} className="btn-outline" title="Guided Phenomena Demonstrations">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Demos</span>
            </button>

            <button
              onClick={onToggleSetup}
              className={
                isSetupVisible
                  ? 'btn-outline !text-sky-400'
                  : 'btn-lime text-sm'
              }
            >
              {isSetupVisible ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5" />
                  <span>Hide setup</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  <span>Setup menu</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={onResetAll}
              title="Reset parameters to defaults"
              className="btn-outline !px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
