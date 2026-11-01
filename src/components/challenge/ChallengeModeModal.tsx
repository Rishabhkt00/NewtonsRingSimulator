import React, { useState } from 'react';
import { ChallengeState, OpticalParameters } from '../../types/physics';
import confetti from 'canvas-confetti';
import {
  Trophy,
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Target,
  ArrowRight,
} from 'lucide-react';

interface Props {
  challenge: ChallengeState;
  params: OpticalParameters;
  onStartNewChallenge: (target: 'wavelength' | 'medium_refractive_index' | 'radius_curvature') => void;
  onSubmitGuess: (guess: number) => void;
  onExitChallenge: () => void;
}

export const ChallengeModeModal: React.FC<Props> = ({
  challenge,
  params,
  onStartNewChallenge,
  onSubmitGuess,
  onExitChallenge,
}) => {
  const [inputVal, setInputVal] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val > 0) {
      onSubmitGuess(val);
      // If error is small, celebrate with confetti!
      const err = Math.abs((val - challenge.trueValue) / challenge.trueValue) * 100;
      if (err <= 5.0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const getTargetTitle = () => {
    switch (challenge.targetProperty) {
      case 'wavelength':
        return 'Unknown Monochromatic Source Wavelength (λ)';
      case 'medium_refractive_index':
        return 'Unknown Liquid Medium Refractive Index (μ)';
      case 'radius_curvature':
        return 'Unknown Lens Radius of Curvature (R)';
    }
  };

  return (
    <div className="w-full lab-panel p-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-lab-950 via-[#131224] to-lab-950 shadow-2xl mb-4 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between pb-3 mb-3 border-b border-amber-500/20 gap-3">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
          <div>
            <h3 className="font-bold text-amber-300 text-sm tracking-wide">
              VIRTUAL PRACTICAL EXAM & MYSTERY CHALLENGE
            </h3>
            <span className="text-[11px] text-slate-400">
              Measure the interference rings with the travelling microscope to solve for the hidden parameter!
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStartNewChallenge(challenge.targetProperty)}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Randomize Mystery</span>
          </button>

          <button
            onClick={onExitChallenge}
            className="px-2.5 py-1 text-xs rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900/60"
          >
            Exit Exam Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        {/* Challenge Goal & Clues */}
        <div className="md:col-span-2 p-3 rounded-lg bg-slate-950/80 border border-amber-500/20 space-y-2">
          <div className="flex items-center space-x-2 text-amber-300 font-semibold">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Target: {getTargetTitle()}</span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            {challenge.hint}
          </p>

          <div className="text-[11px] text-slate-400 flex flex-wrap gap-3 pt-1 border-t border-slate-800">
            <span>Known Apparatus Parameters:</span>
            {challenge.targetProperty !== 'radius_curvature' && (
              <span className="text-slate-200">R = {params.radiusCurvature.toFixed(2)} m</span>
            )}
            {challenge.targetProperty !== 'wavelength' && (
              <span className="text-slate-200">λ = {params.wavelength} nm</span>
            )}
            {challenge.targetProperty !== 'medium_refractive_index' && (
              <span className="text-slate-200">μ = {params.mediumRefractiveIndex.toFixed(3)}</span>
            )}
          </div>
        </div>

        {/* User Submission Box */}
        <div className="p-3 rounded-lg bg-slate-950/80 border border-amber-500/20 flex flex-col justify-between">
          {!challenge.submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  Your Calculated Value ({challenge.unit}):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={inputVal}
                    placeholder={`e.g. ${challenge.targetProperty === 'wavelength' ? '546' : challenge.targetProperty === 'radius_curvature' ? '1.25' : '1.42'}`}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-amber-500/40 rounded text-amber-300 font-bold focus:border-amber-400 outline-none text-sm"
                  />
                  <span className="text-slate-400 font-bold">{challenge.unit}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded shadow transition-all flex items-center justify-center space-x-1"
              >
                <span>Submit Evaluation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="space-y-2 text-center py-1">
              <div className="flex items-center justify-center space-x-1.5">
                {(challenge.errorPercent || 0) <= 5.0 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-400" />
                )}
                <span className="font-bold text-slate-100 text-sm">
                  {(challenge.errorPercent || 0) <= 5.0 ? 'Measurement Verified!' : 'Needs Improvement'}
                </span>
              </div>

              <div className="text-[11px] space-y-1 text-slate-300">
                <div>Your Submission: <strong className="text-amber-300">{challenge.userGuess} {challenge.unit}</strong></div>
                <div>Actual True Value: <strong className="text-emerald-400">{challenge.trueValue} {challenge.unit}</strong></div>
                <div>
                  Percentage Error:{' '}
                  <strong className={(challenge.errorPercent || 0) <= 5.0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {challenge.errorPercent?.toFixed(2)}%
                  </strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setInputVal('');
                  onStartNewChallenge(challenge.targetProperty);
                }}
                className="mt-2 w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
              >
                Try Next Mystery Target
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
