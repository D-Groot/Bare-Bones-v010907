import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface AlertBannersProps {
  panicModeEnabled: boolean;
  panicAllowance: number;
  onDeactivatePanic: () => void;
  currentDay: number;
  todaySpent: number;
  dailyAllowance: number;
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** Panic-mode and over-allowance banners shown beneath the timeline. */
export const AlertBanners: React.FC<AlertBannersProps> = ({
  panicModeEnabled,
  panicAllowance,
  onDeactivatePanic,
  currentDay,
  todaySpent,
  dailyAllowance,
}) => {
  const isOver = todaySpent > dailyAllowance;
  return (
    <>
      {panicModeEnabled && (
        <div
          role="alert"
          className="w-full bg-rose-50 dark:bg-rose-600/15 border border-rose-200 dark:border-rose-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-rose-800 dark:text-rose-200 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            </div>
            <div>
              <strong className="text-rose-900 dark:text-white block font-bold">
                Panic Squeeze Mode active: discretionary spending frozen
              </strong>
              <span className="text-rose-700 dark:text-rose-300 text-xs">
                Your survival allowance is{' '}
                <strong className="font-mono text-rose-900 dark:text-white tabular-nums">{inr(panicAllowance)}/day</strong>.
                Stick to food and essentials.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onDeactivatePanic}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors self-end sm:self-auto focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            Deactivate
          </button>
        </div>
      )}

      {isOver && !panicModeEnabled && (
        <div
          role="alert"
          className="w-full bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-rose-800 dark:text-rose-200 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            </div>
            <div>
              <strong className="font-bold text-rose-900 dark:text-white block">
                Daily spending alert: limit exceeded on Day {currentDay}
              </strong>
              <span className="text-rose-700 dark:text-rose-300/90 text-xs">
                You spent <strong className="font-mono tabular-nums">{inr(todaySpent)}</strong> today against an allowance of{' '}
                <strong className="font-mono tabular-nums">{inr(dailyAllowance)}</strong>, which is{' '}
                <strong className="font-mono tabular-nums">{inr(todaySpent - dailyAllowance)}</strong> over.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-600/40 text-[11px] font-mono font-bold text-rose-800 dark:text-rose-300 uppercase self-end sm:self-auto">
            Runway squeeze
          </span>
        </div>
      )}
    </>
  );
};
