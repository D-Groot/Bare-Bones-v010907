import React, { Suspense, lazy } from 'react';
import type { TabKey } from './TabNavigation';
import type { ComputedFinancials } from '../utils/financeCalculators';
import type { FinancialState } from '../types/finance';
import type { useBudgetActions } from '../hooks/useBudgetActions';
import type { ToastType } from '../hooks/useToasts';

// Each tab is its own chunk, so first paint only downloads the tab being viewed.
const OverviewTab = lazy(() => import('./OverviewTab').then((m) => ({ default: m.OverviewTab })));
const SpendingTab = lazy(() => import('./SpendingTab').then((m) => ({ default: m.SpendingTab })));
const BillsAndSubsTab = lazy(() => import('./BillsAndSubsTab').then((m) => ({ default: m.BillsAndSubsTab })));
const SavingsTab = lazy(() => import('./SavingsTab').then((m) => ({ default: m.SavingsTab })));
const SimulatorTab = lazy(() => import('./SimulatorTab').then((m) => ({ default: m.SimulatorTab })));
const HistoryTab = lazy(() => import('./HistoryTab').then((m) => ({ default: m.HistoryTab })));

interface TabPanelProps {
  tab: TabKey;
  state: FinancialState;
  financials: ComputedFinancials;
  dailyAllowance: number;
  actions: ReturnType<typeof useBudgetActions>;
  notify: (message: string, type?: ToastType) => void;
}

const Fallback = () => (
  <div role="status" aria-live="polite" className="min-h-[320px] rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 animate-pulse flex items-center justify-center text-sm text-slate-500">
    Loading…
  </div>
);

export const TabPanel: React.FC<TabPanelProps> = ({ tab, state, financials, dailyAllowance, actions, notify }) => (
  <Suspense fallback={<Fallback />}>
    {tab === 'Overview' && <OverviewTab financials={financials} />}
    {tab === 'Spending' && (
      <SpendingTab
        currentDay={state.currentDay}
        freeDailyAllowance={dailyAllowance}
        expenses={state.expenses}
        templates={state.templates}
        onAddExpense={actions.addExpense}
        onUpdateExpense={actions.updateExpense}
        onDeleteExpense={actions.deleteExpense}
        onSaveTemplate={actions.saveTemplate}
        onDeleteTemplate={actions.deleteTemplate}
      />
    )}
    {tab === 'Bills & Subs' && (
      <BillsAndSubsTab
        commitments={state.fixedCommitments}
        subscriptions={state.subscriptions}
        currentDay={state.currentDay}
        onAddCommitment={actions.addCommitment}
        onToggleCommitment={actions.toggleCommitment}
        onDeleteCommitment={actions.deleteCommitment}
        onAddSubscription={actions.addSubscription}
        onToggleSubscription={actions.toggleSubscription}
        onDeleteSubscription={actions.deleteSubscription}
      />
    )}
    {tab === 'Savings' && (
      <SavingsTab
        goals={state.savingsGoals}
        availableBalance={financials.remainingBalance}
        stillNeeded={financials.stillNeededForSavings}
        totalSaved={financials.totalMovedToSavings}
        onAddGoal={actions.addGoal}
        onUpdateGoal={actions.updateGoal}
        onDeleteGoal={actions.deleteGoal}
        onMoveToGoal={actions.moveToGoal}
        onWithdrawFromGoal={actions.withdrawFromGoal}
        onNotify={notify}
      />
    )}
    {tab === 'Simulator' && (
      <SimulatorTab baseState={state} onApplyDecision={actions.applyDecision} onNotify={notify} />
    )}
    {tab === 'History' && (
      <HistoryTab
        history={state.history}
        currentFinancials={financials}
        onEndMonth={actions.endMonth}
        onDeleteHistoryMonth={actions.deleteHistoryMonth}
      />
    )}
  </Suspense>
);
