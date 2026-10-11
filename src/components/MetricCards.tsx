import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
  HeartPulse,
  ShieldAlert,
  HelpCircle,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ComputedFinancials } from '../utils/financeCalculators';

interface MetricCardsProps {
  financials: ComputedFinancials;
  panicModeEnabled?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ financials, panicModeEnabled }) => {
  const [showHealthModal, setShowHealthModal] = useState(false);

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-teal-600 dark:text-teal-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-emerald-600 dark:text-emerald-400';
    if (score <= 60) return 'text-amber-600 dark:text-amber-400';
    if (score <= 80) return 'text-orange-600 dark:text-orange-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const displayedAllowance = panicModeEnabled
    ? financials.panicModeDailyAllowance
    : financials.freeDailyAllowance;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* 1. Remaining Balance */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/30">
                <Wallet className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Remaining balance</span>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
              Day {financials.currentDay}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
              ₹{financials.remainingBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>of ₹{financials.startingBudget.toLocaleString('en-IN')} budget</span>
              <span className="text-[11px] text-violet-600 dark:text-violet-400 font-mono font-semibold">
                {Math.round((financials.remainingBalance / financials.totalIncome) * 100)}% left
              </span>
            </div>
          </div>
        </div>

        {/* 2. Daily Allowance */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  panicModeEnabled
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                }`}
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {panicModeEnabled ? 'Panic allowance' : 'Daily allowance'}
              </span>
            </div>
            {panicModeEnabled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold uppercase">
                Austerity
              </span>
            )}
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
              ₹{displayedAllowance.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>free to spend / day</span>
              <span className="text-[11px] text-slate-500 font-mono">
                Burn: ₹{financials.burnRatePerDay}/d
              </span>
            </div>
          </div>
        </div>

        {/* 3. Financial Health */}
        <button
          type="button"
          onClick={() => setShowHealthModal(true)}
          className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 hover:border-violet-400 dark:hover:border-violet-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-500"
          title="Click to view full health score breakdown"
          aria-label={`Financial Health Score: ${financials.healthScore} out of 100, ${financials.healthRating}. Click to view full breakdown`}
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                <HeartPulse className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Financial health</span>
            </div>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 transition-colors" aria-hidden="true" />
          </div>
          <div className="mt-4 w-full">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums flex items-baseline gap-2">
              <span>{financials.healthScore}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ 100</span>
            </div>
            <div
              className={`text-xs font-semibold mt-1 flex items-center justify-between ${getHealthColor(
                financials.healthScore
              )}`}
            >
              <span>{financials.healthRating}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 underline font-normal">View breakdown</span>
            </div>
          </div>
        </button>

        {/* 4. Financial Risk & Projected Runway */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/50">
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Financial risk</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
              <span>{financials.daysUntilBroke}d runway</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums flex items-baseline gap-2">
              <span>{financials.riskScore}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ 100</span>
            </div>
            <div
              className={`text-xs font-semibold mt-1 flex items-center justify-between ${getRiskColor(
                financials.riskScore
              )}`}
            >
              <span>{financials.riskRating}</span>
              {financials.projectedZeroDay ? (
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                  Depletes Day {financials.projectedZeroDay}
                </span>
              ) : (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Survives Day 30</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Score Breakdown Modal */}
      {showHealthModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="health-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowHealthModal(false)}
              aria-label="Close health breakdown modal"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <HeartPulse className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 id="health-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Health Score Breakdown ({financials.healthScore} / 100)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated dynamically from spend pace, safety buffer, and savings progress.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {financials.healthScoreBreakdown.map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-white">{item.label}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {item.score} / {item.max} pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Survival Recommendations */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Survival Recommendations</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {financials.survivalAdvice.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-violet-500 dark:text-violet-400" aria-hidden="true">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHealthModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
