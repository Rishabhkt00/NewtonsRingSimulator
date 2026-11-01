import React from 'react';
import { OpticalParameters } from '../../types/physics';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  params: OpticalParameters;
  onChangeParams: (update: Partial<OpticalParameters>) => void;
}

export const GuidedDemosModal: React.FC<Props> = ({
  isOpen,
  onClose,
  params,
  onChangeParams,
}) => {
  if (!isOpen) return null;

  const demos = [
    {
      id: 'lambda_quarter',
      title: 'Lift Lens by λ/4 (Dark Spot turns Bright)',
      desc: 'Vertical displacement of d₀ = λ/4 increases path difference by 2d₀ = λ/2 (phase change π), cancelling the boundary reflection π phase shift. The central spot changes from dark to bright!',
      badge: 'Optical Path',
      color: 'border-amber-500/40 text-amber-300',
      action: () => {
        onChangeParams({
          lensDisplacement: Math.round(params.wavelength / 4),
          lightMode: 'reflected',
          hasIrregularity: false,
        });
        onClose();
      },
    },
    {
      id: 'transmitted',
      title: 'Reflected vs Transmitted Complementarity',
      desc: 'In transmitted light, there is no phase change on reflection. Constructive and destructive interference interchange, yielding complementary rings and a bright central spot at contact.',
      badge: 'Complementary',
      color: 'border-emerald-500/40 text-emerald-300',
      action: () => {
        onChangeParams({
          lightMode: params.lightMode === 'reflected' ? 'transmitted' : 'reflected',
        });
        onClose();
      },
    },
    {
      id: 'white_light',
      title: 'White Light Dispersion & Washout',
      desc: 'Replaces monochromatic light with full visible spectrum. Inner blue rings and outer red rings appear near center, but higher-order fringes wash out into white due to short coherence length.',
      badge: 'Coherence',
      color: 'border-purple-500/40 text-purple-300',
      action: () => {
        onChangeParams({
          wavelengthPreset: 'white',
          lensDisplacement: 0,
          hasIrregularity: false,
        });
        onClose();
      },
    },
    {
      id: 'sodium_doublet',
      title: 'Sodium D₁/D₂ Doublet Contrast Beats',
      desc: 'Superposition of two closely spaced yellow wavelengths (589.0 nm and 589.6 nm). As lens displacement increases, fringes periodically lose contrast and reappear (optical beats).',
      badge: 'Beats',
      color: 'border-amber-500/40 text-amber-300',
      action: () => {
        onChangeParams({
          wavelengthPreset: 'sodium_doublet',
          wavelength: 589.0,
        });
        onClose();
      },
    },
    {
      id: 'liquid_medium',
      title: 'Introduce Liquid Medium (Contraction by 1/√μ)',
      desc: 'Introducing liquid (water μ=1.333 or oil μ=1.516) into the film gap contracts all ring diameters by a factor of 1/√μ, enabling precise refractometry of micro-volume liquids.',
      badge: 'Refractometry',
      color: 'border-cyan-500/40 text-cyan-300',
      action: () => {
        onChangeParams({
          mediumPreset: 'water',
          mediumRefractiveIndex: 1.333,
        });
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs select-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-lab-900/90">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-sm tracking-wide">
              GUIDED PHYSICS PHENOMENA DEMONSTRATIONS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demos List */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {demos.map((d) => (
            <div
              key={d.id}
              onClick={d.action}
              className="p-3 rounded-xl bg-lab-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-lab-850 cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${d.color}`}>
                    {d.badge}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
                <h4 className="font-bold text-slate-200 text-xs group-hover:text-sky-300 transition-colors">
                  {d.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-1">
                  {d.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-sky-400 font-semibold flex items-center space-x-1">
                <span>Apply Demonstration</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
