import React from 'react';
import { OpticalParameters } from '../../types/physics';
import {
  Atom,
  RotateCcw,
  Settings,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

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
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b14]/95 backdrop-blur-md border-b border-sky-950/60 shadow-xl select-none">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-13 py-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center">
                <Atom className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white font-serif">
                NEWTON'S RINGS
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                LABORATORY SIMULATOR
              </span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center space-x-2.5 font-mono text-xs">
            {/* Guided Demos Trigger */}
            <button
              onClick={onOpenDemosModal}
              className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center space-x-1.5 transition-colors"
              title="Guided Phenomena Demonstrations"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Demos</span>
            </button>

            {/* Toggle Setup Sidebar (Open / Hide) */}
            <button
              onClick={onToggleSetup}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold transition-all border ${
                isSetupVisible
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow'
                  : 'bg-sky-600 hover:bg-sky-500 text-white border-transparent shadow'
              }`}
            >
              {isSetupVisible ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5" />
                  <span>Hide Setup</span>
                </>
              ) : (
                <>
                  <Settings className="w-3.5 h-3.5" />
                  <span>Setup Menu</span>
                </>
              )}
            </button>

            {/* Reset Defaults */}
            <button
              onClick={onResetAll}
              title="Reset parameters to defaults"
              className="p-1.5 rounded-lg bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
