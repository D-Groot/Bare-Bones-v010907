import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Clock, CalendarCheck } from 'lucide-react';
import { Category, FixedCommitment, Subscription } from '../types/finance';
import { CATEGORY_COLORS } from '../utils/financeCalculators';

interface BillsAndSubsTabProps {
  commitments: FixedCommitment[];
  subscriptions: Subscription[];
  currentDay: number;
  onAddCommitment: (item: Omit<FixedCommitment, 'id'>) => void;
  onToggleCommitment: (id: string) => void;
  onDeleteCommitment: (id: string) => void;
  onAddSubscription: (item: Omit<Subscription, 'id'>) => void;
  onToggleSubscription: (id: string) => void;
  onDeleteSubscription: (id: string) => void;
}

const CATEGORIES: Category[] = [
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Food & Drink',
  'Transport',
  'Shopping',
  'Education',
  'Other',
];

export const BillsAndSubsTab: React.FC<BillsAndSubsTabProps> = ({
  commitments,
  subscriptions,
  currentDay,
  onAddCommitment,
  onToggleCommitment,
  onDeleteCommitment,
  onAddSubscription,
  onToggleSubscription,
  onDeleteSubscription,
}) => {
  const [activeTab, setActiveTab] = useState<'commitments' | 'subscriptions'>('commitments');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Housing');
  const [dueDay, setDueDay] = useState(1);

  const totalCommitments = commitments.reduce((acc, c) => acc + c.amount, 0);
  const totalSubscriptions = subscriptions.reduce((acc, s) => acc + s.amount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (activeTab === 'commitments') {
      onAddCommitment({
        title: title.trim(),
        amount: parsedAmount,
        category,
        dueDay,
        isPaid: currentDay >= dueDay,
      });
    } else {
      onAddSubscription({
        title: title.trim(),
        amount: parsedAmount,
        category,
        dueDay,
        isPaid: currentDay >= dueDay,
      });
    }

    setTitle('');
    setAmount('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Column: Add New Bill / Subscription */}
      <div className="lg:col-span-5 bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Add Recurring Obligation</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Lock in your non-negotiable monthly expenses to calculate an accurate safe daily allowance.
        </p>

        {/* Type Toggle */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('commitments');
              setCategory('Housing');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'commitments'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fixed Bill
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('subscriptions');
              setCategory('Entertainment');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Subscription
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="bill-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {activeTab === 'commitments' ? 'Bill Name' : 'Subscription Name'}
            </label>
            <input
              id="bill-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeTab === 'commitments' ? 'e.g. PG Rent / Room Share' : 'e.g. Netflix / Spotify'}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-amount" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Monthly (₹)
              </label>
              <input
                id="bill-amount"
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2500"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono tabular-nums focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label htmlFor="bill-due-day" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Due Day (1-30)
              </label>
              <input
                id="bill-due-day"
                type="number"
                min="1"
                max="30"
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono tabular-nums focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bill-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="bill-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-violet-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-2 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add {activeTab === 'commitments' ? 'Bill' : 'Subscription'}</span>
          </button>
        </form>
      </div>

      {/* Right Column: List of Commitments & Subscriptions */}
      <div className="lg:col-span-7 space-y-6">
        {/* Fixed Commitments Section */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Fixed Commitments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rent, WiFi, utilities & dues</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Total</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                ₹{totalCommitments.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {commitments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No fixed bills registered.</p>
          ) : (
            <div className="space-y-2.5">
              {commitments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleCommitment(c.id)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                      title={c.isPaid ? 'Mark as unpaid' : 'Mark as paid'}
                      aria-label={`Toggle payment for ${c.title}`}
                    >
                      {c.isPaid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" aria-hidden="true" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-semibold ${c.isPaid ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {c.title}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Due Day {c.dueDay} · {c.isPaid ? 'Paid' : currentDay >= c.dueDay ? 'Overdue!' : 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white tabular-nums">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteCommitment(c.id)}
                      aria-label={`Delete ${c.title}`}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete bill"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscriptions Section */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Subscriptions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recurring streaming, gym & digital plans</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Total</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                ₹{totalSubscriptions.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {subscriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No subscriptions registered.</p>
          ) : (
            <div className="space-y-2.5">
              {subscriptions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleSubscription(s.id)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                      title={s.isPaid ? 'Mark as unpaid' : 'Mark as paid'}
                      aria-label={`Toggle payment for ${s.title}`}
                    >
                      {s.isPaid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" aria-hidden="true" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-semibold ${s.isPaid ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {s.title}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[s.category] }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Due Day {s.dueDay} · {s.isPaid ? 'Paid' : currentDay >= s.dueDay ? 'Overdue!' : 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white tabular-nums">
                      ₹{s.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteSubscription(s.id)}
                      aria-label={`Delete ${s.title}`}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete subscription"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
