import React, { useState } from 'react';
import { Target, ArrowDownCircle, ArrowUpCircle, Plus, Trash2, Sparkles, Edit3, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types/finance';
import { soundEffects } from '../utils/audio';

interface SavingsTabProps {
  goals: SavingsGoal[];
  availableBalance: number;
  stillNeeded: number;
  totalSaved: number;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal?: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onMoveToGoal: (id: string, amount: number) => void;
  onWithdrawFromGoal: (id: string, amount: number) => void;
  onNotify?: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SavingsTab: React.FC<SavingsTabProps> = ({
  goals,
  availableBalance,
  stillNeeded,
  totalSaved,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onMoveToGoal,
  onWithdrawFromGoal,
  onNotify,
}) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [moveAmounts, setMoveAmounts] = useState<Record<string, string>>({});

  // Edit Goal modal
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    if (!goalName.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    onAddGoal({
      title: goalName.trim(),
      targetAmount: parsedTarget,
      currentAmount: 0,
    });

    soundEffects.playSuccess();
    onNotify?.(`Savings goal "${goalName.trim()}" created!`, 'success');
    setGoalName('');
    setTargetAmount('');
  };

  const handleMove = (goalId: string) => {
    const amtStr = moveAmounts[goalId];
    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0) return;

    if (amt > availableBalance) {
      soundEffects.playWarning();
      onNotify?.(`Insufficient balance: You only have ₹${availableBalance.toLocaleString('en-IN')} remaining.`, 'warning');
      return;
    }

    onMoveToGoal(goalId, amt);
    setMoveAmounts((prev) => ({ ...prev, [goalId]: '' }));

    const targetGoal = goals.find((g) => g.id === goalId);
    if (targetGoal && targetGoal.currentAmount + amt >= targetGoal.targetAmount) {
      soundEffects.playCelebration();
      onNotify?.(`🎉 Goal reached: "${targetGoal.title}" is 100% funded!`, 'success');
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore in environments without canvas
      }
    } else {
      soundEffects.playSuccess();
      onNotify?.(`Moved ₹${amt.toLocaleString('en-IN')} into savings goal!`, 'success');
    }
  };

  const handleWithdraw = (goalId: string) => {
    const amtStr = moveAmounts[goalId];
    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0) return;

    const targetGoal = goals.find((g) => g.id === goalId);
    if (targetGoal && amt > targetGoal.currentAmount) {
      soundEffects.playWarning();
      onNotify?.(`This goal only holds ₹${targetGoal.currentAmount.toLocaleString('en-IN')}.`, 'warning');
      return;
    }

    onWithdrawFromGoal(goalId, amt);
    soundEffects.playSuccess();
    onNotify?.(`Withdrew ₹${amt.toLocaleString('en-IN')} back to available balance.`, 'info');
    setMoveAmounts((prev) => ({ ...prev, [goalId]: '' }));
  };

  const handleStartEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditTarget(goal.targetAmount.toString());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !onUpdateGoal) return;
    const parsedTarget = parseFloat(editTarget);
    if (!editTitle.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    onUpdateGoal({
      ...editingGoal,
      title: editTitle.trim(),
      targetAmount: parsedTarget,
    });

    soundEffects.playSuccess();
    setEditingGoal(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Column: Create a Goal */}
      <div className="lg:col-span-5 bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Create a savings goal</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Every rupee locked in savings reduces financial risk and builds your emergency runway.
          </p>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label htmlFor="goal-name-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Goal name
              </label>
              <input
                id="goal-name-input"
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. Emergency Stash"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label htmlFor="goal-target-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Target (₹)
              </label>
              <input
                id="goal-target-input"
                type="number"
                min="1"
                step="any"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="1000"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono tabular-nums focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-2 focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Create Goal</span>
            </button>
          </form>
        </div>

        {/* Informative Callout */}
        <div className="mt-8 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 text-xs text-violet-900 dark:text-violet-300 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-semibold block text-slate-900 dark:text-white">Why savings matter</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              When you deposit money into a goal, it protects you against unexpected expenses while keeping your day-to-day burn rate disciplined.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Goal Progress Cards */}
      <div className="lg:col-span-7 space-y-4">
        {/* Top Summary Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Saved Across Goals</span>
            <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              ₹{totalSaved.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">Still Needed for Targets</span>
            <div className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              ₹{stillNeeded.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 shadow-sm">
            <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No active savings goals</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a goal on the left to start locking in rainy day funds!
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                      {isCompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-600/30">
                          Completed! 🎉
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      ₹{goal.currentAmount.toLocaleString('en-IN')} of ₹{goal.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onUpdateGoal && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(goal)}
                        aria-label={`Edit ${goal.title}`}
                        className="p-1 rounded text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        title="Edit goal"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`Delete ${goal.title}`}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                    <span>Progress</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">{percent}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.title} Progress`}
                    className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden"
                  >
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Quick Move / Withdraw Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:w-36">
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      aria-label={`Amount to deposit or withdraw for ${goal.title}`}
                      value={moveAmounts[goal.id] || ''}
                      onChange={(e) =>
                        setMoveAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono tabular-nums focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleMove(goal.id)}
                      aria-label={`Move funds to ${goal.title}`}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Deposit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWithdraw(goal.id)}
                      aria-label={`Withdraw funds from ${goal.title}`}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-goal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setEditingGoal(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <h3 id="edit-goal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Edit Savings Goal
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
              <div>
                <label htmlFor="edit-goal-title-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Goal Name
                </label>
                <input
                  id="edit-goal-title-input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="edit-goal-target-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  id="edit-goal-target-input"
                  type="number"
                  min="1"
                  step="any"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono tabular-nums focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
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
