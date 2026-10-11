import React, { useState } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  FileText,
  AlertTriangle,
  PiggyBank,
  FastForward,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { Category, FinancialState, SimulatorAction, SimulatorActionType } from '../types/finance';
import { simulateDecision } from '../utils/financeCalculators';
import { soundEffects } from '../utils/audio';

interface SimulatorTabProps {
  baseState: FinancialState;
  onApplyDecision: (action: SimulatorAction) => void;
  onNotify?: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const CATEGORIES: Category[] = [
  'Food & Drink',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Other',
];

interface QuickScenario {
  label: string;
  type: SimulatorActionType;
  title: string;
  amount: number;
  category: Category;
  emoji: string;
}

const GEN_Z_SCENARIOS: QuickScenario[] = [
  {
    label: 'Late night Swiggy',
    type: 'purchase',
    title: 'Midnight Biryani on Swiggy',
    amount: 450,
    category: 'Food & Drink',
    emoji: '🍕',
  },
  {
    label: 'Concert pass',
    type: 'purchase',
    title: 'Music Festival Weekend Pass',
    amount: 2000,
    category: 'Entertainment',
    emoji: '🎟️',
  },
  {
    label: 'Sneaker sale',
    type: 'purchase',
    title: 'Sneakers Flash Sale',
    amount: 1800,
    category: 'Shopping',
    emoji: '👟',
  },
  {
    label: 'Gym membership',
    type: 'subscription',
    title: 'Cult.fit Monthly Pass',
    amount: 899,
    category: 'Health',
    emoji: '💪',
  },
  {
    label: 'Emergency repair',
    type: 'surprise',
    title: 'Broken Laptop Charger',
    amount: 1200,
    category: 'Utilities',
    emoji: '⚡',
  },
];

export const SimulatorTab: React.FC<SimulatorTabProps> = ({ baseState, onApplyDecision, onNotify }) => {
  const [actionType, setActionType] = useState<SimulatorActionType>('purchase');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('0');
  const [category, setCategory] = useState<Category>('Food & Drink');
  const [daysToSkip, setDaysToSkip] = useState(3);

  const amount = parseFloat(amountStr) || 0;

  const currentAction: SimulatorAction = {
    type: actionType,
    title: title || (actionType === 'skip_days' ? `Fast-forward ${daysToSkip} days` : 'Simulated Move'),
    amount,
    category,
    daysToSkip,
  };

  const simResult = simulateDecision(baseState, currentAction);

  const actionButtons = [
    {
      type: 'purchase' as SimulatorActionType,
      label: 'Make a purchase',
      subtext: 'Buy something now',
      icon: ShoppingBag,
    },
    {
      type: 'subscription' as SimulatorActionType,
      label: 'Add subscription',
      subtext: 'New recurring charge',
      icon: RefreshCw,
    },
    {
      type: 'bill' as SimulatorActionType,
      label: 'Take a bill',
      subtext: 'New fixed commitment',
      icon: FileText,
    },
    {
      type: 'surprise' as SimulatorActionType,
      label: 'Surprise cost',
      subtext: 'Unexpected expense',
      icon: AlertTriangle,
    },
    {
      type: 'savings' as SimulatorActionType,
      label: 'Move to savings',
      subtext: 'Set money aside',
      icon: PiggyBank,
    },
    {
      type: 'skip_days' as SimulatorActionType,
      label: 'Skip days',
      subtext: 'Fast-forward time',
      icon: FastForward,
    },
  ];

  const handleApplyScenario = (sc: QuickScenario) => {
    setActionType(sc.type);
    setTitle(sc.title);
    setAmountStr(sc.amount.toString());
    setCategory(sc.category);
    soundEffects.playSuccess();
  };

  const handleApply = () => {
    if (actionType !== 'skip_days' && amount <= 0) {
      onNotify?.('Enter an amount greater than 0 to apply.', 'warning');
      return;
    }
    soundEffects.playSuccess();
    onApplyDecision(currentAction);
    setAmountStr('0');
    setTitle('');
  };

  const formatDelta = (val: number, isCurrency = false, isPts = false) => {
    if (val === 0) return isPts ? '0 pts' : '0';
    const sign = val > 0 ? '+' : '';
    if (isCurrency) return `${sign}₹${val.toLocaleString('en-IN')}`;
    if (isPts) return `${sign}${val} pts`;
    return `${sign}${val}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Column: Decision Simulator Controls */}
      <div className="lg:col-span-5 bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Decision simulator</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Try a financial move before you commit. See the ripple effects live.
        </p>

        {/* Quick Gen Z Temptation Presets */}
        <div className="mb-5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" aria-hidden="true" />
            <span>Common Gen Z Temptations</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {GEN_Z_SCENARIOS.map((sc) => (
              <button
                key={sc.label}
                type="button"
                onClick={() => handleApplyScenario(sc)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-violet-400 dark:hover:border-violet-500/60 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <span aria-hidden="true">{sc.emoji}</span>
                <span>{sc.label}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px] tabular-nums">₹{sc.amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6 Decision Action Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {actionButtons.map((btn) => {
            const Icon = btn.icon;
            const isSelected = actionType === btn.type;

            return (
              <button
                key={btn.label}
                type="button"
                onClick={() => setActionType(btn.type)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-slate-900/90 border-amber-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-amber-500/50'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} aria-hidden="true" />
                  <span className="text-xs font-semibold">{btn.label}</span>
                </div>
                <span className="text-[10px] text-slate-500">{btn.subtext}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Form Fields based on Action Type */}
        <div className="space-y-4">
          {actionType === 'skip_days' ? (
            <div>
              <label htmlFor="sim-days-skip" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Fast-Forward (Days)
              </label>
              <select
                id="sim-days-skip"
                value={daysToSkip}
                onChange={(e) => setDaysToSkip(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500"
              >
                {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                  <option key={d} value={d}>
                    Advance {d} day{d > 1 ? 's' : ''} (Burn at average allowance)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="sim-title-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Name
                </label>
                <input
                  id="sim-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is it for?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="sim-amount-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount (₹)
                </label>
                <input
                  id="sim-amount-input"
                  type="number"
                  min="0"
                  step="any"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white font-mono tabular-nums text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              {actionType !== 'savings' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-violet-500 ${
                          category === cat
                            ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/50'
                            : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Projected Impact */}
      <div className="lg:col-span-7 bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Projected impact</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            If you commit this decision, here's how your month shifts.
          </p>

          {/* Impact Breakdown Table */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 pb-6 border-b border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Remaining balance</span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  simResult.deltaBalance < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : simResult.deltaBalance > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {formatDelta(simResult.deltaBalance, true)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Daily allowance</span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  simResult.deltaDaily < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : simResult.deltaDaily > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {formatDelta(simResult.deltaDaily, true)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Financial risk</span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  simResult.deltaRisk > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : simResult.deltaRisk < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {formatDelta(simResult.deltaRisk, false, true)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Financial health</span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  simResult.deltaHealth < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : simResult.deltaHealth > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {formatDelta(simResult.deltaHealth, false, true)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Savings still needed</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                ₹{simResult.simulatedSavingsNeeded.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">After decision, day</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                Day {simResult.afterDecisionDay}
              </span>
            </div>
          </div>

          {/* 4 Mini Stat Badges */}
          <div className="grid grid-cols-4 gap-3 my-6 text-center">
            <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
              <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                BALANCE
              </div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                ₹{simResult.simulatedBalance.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
              <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                DAILY ₹
              </div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                ₹{simResult.simulatedDaily}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
              <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                RISK
              </div>
              <div
                className={`text-sm sm:text-base font-extrabold font-mono tabular-nums mt-1 ${
                  simResult.simulatedRisk <= 30 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {simResult.simulatedRisk}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
              <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                HEALTH
              </div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                {simResult.simulatedHealth}
              </div>
            </div>
          </div>
        </div>

        {/* Verdict Callout Banner & Action Button */}
        <div>
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-3 mb-4 ${
              simResult.verdict === 'danger'
                ? 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                : simResult.verdict === 'caution'
                ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {simResult.verdict === 'danger' ? (
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            )}
            <span>{simResult.verdictMessage}</span>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span>Apply to make it real</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
