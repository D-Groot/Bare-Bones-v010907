import React, { useState } from 'react';
import { Archive, Plus, Trash2, TrendingUp, Calendar, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { MonthArchive } from '../types/finance';
import { ComputedFinancials } from '../utils/financeCalculators';

interface HistoryTabProps {
  history: MonthArchive[];
  currentFinancials: ComputedFinancials;
  onEndMonth: (newBudget: number, carryOverBalance: boolean) => void;
  onDeleteHistoryMonth: (id: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  currentFinancials,
  onEndMonth,
  onDeleteHistoryMonth,
}) => {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [nextBudget, setNextBudget] = useState('10000');
  const [carryOver, setCarryOver] = useState(false);

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxSpend = Math.max(15000, ...history.map((h) => h.totalSpent));
  const maxHealth = 100;

  const handleArchiveConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = parseFloat(nextBudget) || 10000;
    onEndMonth(budgetVal, carryOver);
    setShowArchiveModal(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Month-over-month trends card */}
      <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Month-over-month trends</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Total spending (bars) and health score (green line) for each closed month.
        </p>

        {history.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No closed months yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Use &ldquo;End month &amp; archive&rdquo; to bank this month and start the next.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[420px]">
              {/* Combo Bar & Line Chart SVG */}
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible" aria-label="Month over Month Trends Chart">
                {/* Horizontal Guide lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} className="stroke-slate-300 dark:stroke-slate-700" />

                {/* Left Y Axis label */}
                <text x={paddingX - 8} y={paddingY + 4} fill="#64748B" fontSize="9" textAnchor="end" fontFamily="monospace">
                  ₹{(maxSpend / 1000).toFixed(0)}k
                </text>
                <text x={paddingX - 8} y={chartHeight - paddingY} fill="#64748B" fontSize="9" textAnchor="end" fontFamily="monospace">
                  ₹0
                </text>

                {/* Bars for Total Spent */}
                {history.map((m, idx) => {
                  const barWidth = 32;
                  const stepX = (chartWidth - paddingX * 2) / history.length;
                  const x = paddingX + idx * stepX + stepX / 2 - barWidth / 2;
                  const barHeight = ((chartHeight - paddingY * 2) * m.totalSpent) / maxSpend;
                  const y = chartHeight - paddingY - barHeight;

                  return (
                    <g key={`bar-${m.id}`}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="6"
                        fill="#7C3AED"
                        className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <title>
                          {m.monthName} {m.year}: Spent ₹{m.totalSpent.toLocaleString('en-IN')}
                        </title>
                      </rect>
                      {/* Month label below */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - paddingY + 14}
                        fill="#94A3B8"
                        fontSize="10"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {m.monthName.slice(0, 3)}
                      </text>
                    </g>
                  );
                })}

                {/* Line for Health Score */}
                {(() => {
                  const stepX = (chartWidth - paddingX * 2) / history.length;
                  const points = history.map((m, idx) => {
                    const x = paddingX + idx * stepX + stepX / 2;
                    const y = chartHeight - paddingY - ((chartHeight - paddingY * 2) * m.finalHealthScore) / maxHealth;
                    return { x, y, score: m.finalHealthScore };
                  });

                  const lineD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

                  return (
                    <g>
                      <path d={lineD} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                      {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#10B981" stroke="#ffffff" strokeWidth="1.5">
                          <title>Health Score: {p.score}/100</title>
                        </circle>
                      ))}
                    </g>
                  );
                })()}
              </svg>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-violet-600 inline-block" aria-hidden="true" />
                  <span>Total Spent (₹)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" />
                  <span>Financial Health Score (0-100)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Closed Months List */}
      <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Closed months</h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No archived months yet. Hit &ldquo;End month &amp; archive&rdquo; below when you finish Day 30!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Calendar className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {m.monthName} {m.year}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Archived on {m.completedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs sm:text-sm">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Spent</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      ₹{m.totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Saved</span>
                    <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{m.totalSaved.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Health</span>
                    <span className="font-mono tabular-nums font-bold text-violet-600 dark:text-violet-400">
                      {m.finalHealthScore}/100
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteHistoryMonth(m.id)}
                    aria-label={`Delete record for ${m.monthName} ${m.year}`}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors ml-2"
                    title="Delete historical month record"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Action Card: End month & archive */}
      <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">End month &amp; archive</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Bank this month&apos;s records into history, lock your final scores, and start fresh with a new ₹10,000 budget cycle.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowArchiveModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <Archive className="w-4 h-4" aria-hidden="true" />
          <span>Archive This Month</span>
        </button>
      </div>

      {/* Archive Modal */}
      {showArchiveModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowArchiveModal(false)}
              aria-label="Close archive modal"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <h3 id="archive-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Bank Month &amp; Initialize Next Cycle
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your remaining balance of{' '}
              <strong className="text-violet-600 dark:text-violet-400 font-mono tabular-nums">
                ₹{currentFinancials.remainingBalance.toLocaleString('en-IN')}
              </strong>{' '}
              and health score of{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {currentFinancials.healthScore}/100
              </strong>{' '}
              will be permanently recorded.
            </p>

            <form onSubmit={handleArchiveConfirm} className="space-y-4 pt-2">
              <div>
                <label htmlFor="next-budget-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Starting budget for next month (₹)
                </label>
                <input
                  id="next-budget-input"
                  type="number"
                  min="1000"
                  step="500"
                  value={nextBudget}
                  onChange={(e) => setNextBudget(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono tabular-nums focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={carryOver}
                    onChange={(e) => setCarryOver(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                  />
                  <span>
                    Roll over remaining ₹{currentFinancials.remainingBalance.toLocaleString('en-IN')} balance as extra income
                  </span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowArchiveModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Confirm &amp; Bank Month
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
