import React, { useState } from 'react';

interface Props {
  value: number;
  onCommit: (v: number) => void;
  min: number;
  max: number;
  decimals?: number;
  unit?: string;
  ariaLabel: string;
  /** Tailwind classes for text colour / focus ring, e.g. "text-sky-300 focus:border-sky-400" */
  colorClass?: string;
}

/**
 * Small editable numeric readout. Lets the user type a value freely, then
 * commits (clamped to [min, max]) on Enter or blur. Escape cancels.
 */
export const NumberField: React.FC<Props> = ({
  value,
  onCommit,
  min,
  max,
  decimals = 0,
  unit,
  ariaLabel,
  colorClass = 'text-sky-300 focus:border-sky-400',
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null) {
      const v = parseFloat(draft);
      if (Number.isFinite(v)) {
        const clamped = Math.min(max, Math.max(min, v));
        const f = Math.pow(10, decimals);
        onCommit(Math.round(clamped * f) / f);
      }
      setDraft(null);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        title={`Type a value (${min} – ${max}) and press Enter`}
        value={draft ?? value.toFixed(decimals)}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit();
            e.currentTarget.blur();
          } else if (e.key === 'Escape') {
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
        className={`w-16 px-1.5 py-0.5 rounded bg-lab-900 border border-slate-700 text-right font-bold text-[10px] font-mono focus:outline-none ${colorClass}`}
      />
      {unit && <span className={`font-bold ${colorClass.split(' ')[0]}`}>{unit}</span>}
    </span>
  );
};
