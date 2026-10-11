import { CATEGORIES } from '../constants';
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  BookmarkPlus,
  X,
  AlertTriangle,
  Bell,
  BellRing,
  Search,
  Filter,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { Category, Expense, Template } from '../types/finance';
import { CATEGORY_COLORS } from '../utils/financeCalculators';
import { requestBrowserNotificationPermission, sendBrowserWarningNotification } from '../utils/notifications';
import { soundEffects } from '../utils/audio';

interface SpendingTabProps {
  currentDay: number;
  freeDailyAllowance: number;
  expenses: Expense[];
  templates: Template[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onSaveTemplate: (template: Omit<Template, 'id'>) => void;
  onDeleteTemplate: (id: string) => void;
}


export const SpendingTab: React.FC<SpendingTabProps> = ({
  currentDay,
  freeDailyAllowance,
  expenses,
  templates,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food & Drink');
  const [isUnexpected, setIsUnexpected] = useState(false);
  const [expenseDay, setExpenseDay] = useState(currentDay);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'amount-high' | 'amount-low'>('recent');

  // Edit Expense Modal state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Food & Drink');
  const [editDay, setEditDay] = useState(currentDay);
  const [editIsUnexpected, setEditIsUnexpected] = useState(false);

  // Template Modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateAmount, setNewTemplateAmount] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<Category>('Food & Drink');

  const parsedCurrentAmount = parseFloat(amount) || 0;
  const currentDayExpenses = expenses
    .filter((e) => e.dayLogged === expenseDay)
    .reduce((acc, e) => acc + e.amount, 0);
  const projectedTotalDaySpend = currentDayExpenses + parsedCurrentAmount;
  const isExceedingAllowance = parsedCurrentAmount > 0 && projectedTotalDaySpend > freeDailyAllowance;
  const excessAmount = projectedTotalDaySpend - freeDailyAllowance;

  const handleToggleNotifications = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserNotificationsEnabled(granted);
    if (granted) {
      sendBrowserWarningNotification(
        'BareBones Budget Watcher',
        `Browser alerts enabled! We'll alert you if spending exceeds your ₹${freeDailyAllowance} daily allowance.`
      );
    }
  };

  // Handle template one-tap click
  const handleApplyTemplate = (tpl: Template) => {
    setTitle(tpl.title);
    setAmount(tpl.amount.toString());
    setCategory(tpl.category);
    setIsUnexpected(false);
    soundEffects.playSuccess();
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (projectedTotalDaySpend > freeDailyAllowance) {
      soundEffects.playWarning();
      if (browserNotificationsEnabled) {
        sendBrowserWarningNotification(
          '⚠️ Daily Allowance Exceeded!',
          `You spent ₹${parsedAmount} on "${title.trim()}". Total Day ${expenseDay} spend: ₹${projectedTotalDaySpend} (₹${excessAmount} over ₹${freeDailyAllowance}/day limit).`
        );
      }
    } else {
      soundEffects.playSuccess();
    }

    onAddExpense({
      title: title.trim(),
      amount: parsedAmount,
      category,
      dayLogged: expenseDay,
      dateString: `Day ${expenseDay}`,
      isUnexpected,
    });

    setTitle('');
    setAmount('');
    setIsUnexpected(false);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newTemplateAmount);
    if (!newTemplateTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSaveTemplate({
      title: newTemplateTitle.trim(),
      amount: parsedAmount,
      category: newTemplateCategory,
    });

    soundEffects.playSuccess();
    setNewTemplateTitle('');
    setNewTemplateAmount('');
    setShowTemplateModal(false);
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setEditTitle(exp.title);
    setEditAmount(exp.amount.toString());
    setEditCategory(exp.category);
    setEditDay(exp.dayLogged);
    setEditIsUnexpected(Boolean(exp.isUnexpected));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const parsedAmount = parseFloat(editAmount);
    if (!editTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onUpdateExpense({
      ...editingExpense,
      title: editTitle.trim(),
      amount: parsedAmount,
      category: editCategory,
      dayLogged: editDay,
      dateString: `Day ${editDay}`,
      isUnexpected: editIsUnexpected,
    });

    soundEffects.playSuccess();
    setEditingExpense(null);
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesQuery = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-high') return b.amount - a.amount;
        if (sortBy === 'amount-low') return a.amount - b.amount;
        return b.dayLogged - a.dayLogged;
      });
  }, [expenses, searchQuery, filterCategory, sortBy]);

  const totalRecent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Column: Log a purchase */}
      <div className="lg:col-span-5 bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Log a purchase</h3>
          <button
            type="button"
            onClick={handleToggleNotifications}
            aria-label="Toggle browser notifications for budget alerts"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 ${
              browserNotificationsEnabled
                ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-700/60 text-violet-700 dark:text-violet-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Toggle browser notification alerts when exceeding daily allowance"
          >
            {browserNotificationsEnabled ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                <span>Alerts On</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Enable Alerts</span>
              </>
            )}
          </button>
        </div>

        {/* One-tap Templates Header */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">One-tap templates</span>
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>+ Save a template</span>
          </button>
        </div>

        {/* One-tap Templates Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="relative group">
              <button
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                aria-label={`Fill template ${tpl.title} for rupees ${tpl.amount}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-violet-50 dark:bg-slate-900/90 dark:hover:bg-violet-950/60 border border-slate-200 dark:border-slate-700/70 hover:border-violet-300 dark:hover:border-violet-500/50 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-violet-500"
                title={`Click to fill: ${tpl.title} (₹${tpl.amount})`}
              >
                <span>{tpl.title}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">₹{tpl.amount}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Log Expense Form */}
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <div>
            <label htmlFor="exp-title-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              What did you buy?
            </label>
            <input
              id="exp-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Groceries at Zepto"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="exp-amount-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Amount (₹)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Daily Allowance: <strong className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">₹{freeDailyAllowance}</strong>
              </span>
            </label>
            <input
              id="exp-amount-input"
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono tabular-nums focus:outline-none transition-colors ${
                isExceedingAllowance
                  ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/50'
                  : 'border-slate-200 dark:border-slate-700/80 focus:border-violet-500'
              }`}
            />
          </div>

          {/* Visual Warning Indicator if exceeding daily allowance */}
          {isExceedingAllowance && (
            <div role="alert" aria-live="polite" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold text-rose-900 dark:text-rose-200">Daily Allowance Exceeded!</span>
                <p className="text-[11px] text-rose-700 dark:text-rose-300/90 mt-0.5">
                  This expense will push Day {expenseDay} spend to{' '}
                  <strong className="font-mono text-slate-900 dark:text-white tabular-nums">₹{projectedTotalDaySpend}</strong>, which is{' '}
                  <strong className="font-mono text-slate-900 dark:text-white tabular-nums">₹{excessAmount}</strong> over your recommended daily limit of{' '}
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">₹{freeDailyAllowance}</strong>.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-violet-500 ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-sm ring-1 ring-violet-400/50'
                        : 'bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="exp-day-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Day Logged (1-30)
              </label>
              <input
                id="exp-day-input"
                type="number"
                min="1"
                max="30"
                value={expenseDay}
                onChange={(e) => setExpenseDay(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-mono tabular-nums focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={isUnexpected}
                  onChange={(e) => setIsUnexpected(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <span>Unexpected expense</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Expense</span>
          </button>
        </form>
      </div>

      {/* Right Column: Recent Spending with Search & Category Filter */}
      <div className="lg:col-span-7 bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent spending</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {expenses.length} transaction{expenses.length === 1 ? '' : 's'} logged this month
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Total logged</span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                ₹{totalRecent.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Search, Filter, and Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses..."
                aria-label="Search expenses"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter expenses by category"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort expenses"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="recent">Most Recent Day</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {expenses.length === 0
                ? 'No expenses logged yet. Tap a template above or log your first purchase!'
                : 'No expenses match your search or filter.'}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs" aria-label="Logged expenses table">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                    <th className="py-2.5 px-2">Title</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Day</th>
                    <th className="py-2.5 px-2 text-right">Amount</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredExpenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                      <td className="py-2.5 px-2 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{exp.title}</span>
                          {exp.isUnexpected && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold">
                              Unexpected
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[exp.category] || '#94A3B8' }}
                            aria-hidden="true"
                          />
                          <span>{exp.category}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        Day {exp.dayLogged}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(exp)}
                            aria-label={`Edit ${exp.title}`}
                            className="p-1 rounded text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                            title="Edit expense"
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            aria-label={`Delete ${exp.title}`}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowTemplateModal(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2.5">
              <BookmarkPlus className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              <h3 id="template-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Save a One-Tap Template
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save frequent recurring spends like groceries, metro recharge, or lunch for instant one-click logging.
            </p>

            <form onSubmit={handleCreateTemplate} className="space-y-3 pt-2">
              <div>
                <label htmlFor="tpl-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  id="tpl-title"
                  type="text"
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  placeholder="e.g. Groceries"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="tpl-amount" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Default Amount (₹)
                </label>
                <input
                  id="tpl-amount"
                  type="number"
                  min="1"
                  step="any"
                  value={newTemplateAmount}
                  onChange={(e) => setNewTemplateAmount(e.target.value)}
                  placeholder="250"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono tabular-nums focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="tpl-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="tpl-category"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-violet-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-exp-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setEditingExpense(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <h3 id="edit-exp-title" className="text-base font-bold text-slate-900 dark:text-white">
              Edit Expense
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
              <div>
                <label htmlFor="edit-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="edit-amount" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  id="edit-amount"
                  type="number"
                  min="1"
                  step="any"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono tabular-nums focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="edit-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="edit-category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-violet-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="edit-day" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Day Logged
                  </label>
                  <input
                    id="edit-day"
                    type="number"
                    min="1"
                    max="30"
                    value={editDay}
                    onChange={(e) => setEditDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono tabular-nums focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={editIsUnexpected}
                      onChange={(e) => setEditIsUnexpected(e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                    />
                    <span>Unexpected</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
