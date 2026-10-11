import { useCallback, useMemo } from 'react';
import type { Dispatch } from 'react';
import type { BudgetAction } from '../state/budgetReducer';
import type {
  Expense,
  FinancialState,
  FixedCommitment,
  MonthArchive,
  SavingsGoal,
  SimulatorAction,
  Subscription,
  Template,
} from '../types/finance';
import type { ComputedFinancials } from '../utils/financeCalculators';
import { exportBackupJSON, exportExpensesToCSV, validateAndParseBackup } from '../utils/exportImport';
import { INITIAL_FINANCIAL_STATE } from '../utils/storage';
import { soundEffects } from '../utils/audio';
import { makeId } from '../utils/id';
import type { ConfirmOptions } from './useConfirm';
import type { ToastType } from './useToasts';

interface Deps {
  state: FinancialState;
  financials: ComputedFinancials;
  dispatch: Dispatch<BudgetAction>;
  notify: (message: string, type?: ToastType, title?: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Turns UI intents into reducer actions. Everything impure (ids, sounds, toasts,
 * confirmation dialogs, file IO) lives here so budgetReducer stays pure and testable.
 */
export function useBudgetActions({ state, financials, dispatch, notify, confirm }: Deps) {
  const toggleTheme = useCallback(() => dispatch({ type: 'toggle-theme' }), [dispatch]);
  const setDay = useCallback((day: number) => dispatch({ type: 'set-day', day }), [dispatch]);

  const togglePanic = useCallback(() => {
    if (state.panicModeEnabled) soundEffects.playSuccess();
    else soundEffects.playWarning();
    dispatch({ type: 'toggle-panic' });
  }, [dispatch, state.panicModeEnabled]);

  const toggleSound = useCallback(() => dispatch({ type: 'toggle-sound' }), [dispatch]);

  const exportCSV = useCallback(() => {
    exportExpensesToCSV(state.expenses, state.currentDay);
    notify('Expenses exported as CSV.', 'success');
  }, [state.expenses, state.currentDay, notify]);

  const exportJSON = useCallback(() => {
    exportBackupJSON(state);
    notify('Full backup downloaded.', 'success');
  }, [state, notify]);

  const importJSON = useCallback(
    async (file: File) => {
      if (file.size > 2_000_000) {
        notify('That file is too large to be a BareBones backup.', 'error');
        return;
      }
      const parsed = validateAndParseBackup(await file.text());
      if (!parsed) {
        notify('Invalid backup file. Choose a BareBones JSON backup.', 'error');
        return;
      }
      const ok = await confirm({
        title: 'Restore from backup?',
        message: 'This replaces your current budget with the contents of the backup file.',
        confirmLabel: 'Restore',
        isDestructive: true,
      });
      if (!ok) return;
      // Imported files never carry a webhook; keep the one configured on this device.
      dispatch({ type: 'replace', state: { ...parsed, discordWebhookUrl: parsed.discordWebhookUrl || state.discordWebhookUrl } });
      notify('Budget restored from backup.', 'success');
    },
    [confirm, dispatch, notify, state.discordWebhookUrl]
  );

  const reset = useCallback(async () => {
    const ok = await confirm({
      title: 'Reset all data?',
      message: 'This restores the default ₹10,000 demo budget. Your current data will be lost.',
      confirmLabel: 'Reset',
      isDestructive: true,
    });
    if (!ok) return;
    dispatch({ type: 'replace', state: { ...INITIAL_FINANCIAL_STATE, theme: state.theme } });
    notify('Budget reset to the demo state.', 'info');
  }, [confirm, dispatch, notify, state.theme]);

  const handlers = useMemo(
    () => ({
      addExpense: (e: Omit<Expense, 'id'>) =>
        dispatch({ type: 'expense/add', expense: { ...e, id: makeId('exp') } }),
      updateExpense: (expense: Expense) => dispatch({ type: 'expense/update', expense }),
      deleteExpense: (id: string) => {
        dispatch({ type: 'expense/delete', id });
        soundEffects.playSuccess();
      },
      saveTemplate: (t: Omit<Template, 'id'>) =>
        dispatch({ type: 'template/add', template: { ...t, id: makeId('tpl') } }),
      deleteTemplate: (id: string) => dispatch({ type: 'template/delete', id }),

      addCommitment: (item: Omit<FixedCommitment, 'id'>) => {
        dispatch({ type: 'commitment/add', item: { ...item, id: makeId('fix') } });
        soundEffects.playSuccess();
      },
      toggleCommitment: (id: string) => dispatch({ type: 'commitment/toggle', id }),
      deleteCommitment: (id: string) => dispatch({ type: 'commitment/delete', id }),
      addSubscription: (item: Omit<Subscription, 'id'>) => {
        dispatch({ type: 'subscription/add', item: { ...item, id: makeId('sub') } });
        soundEffects.playSuccess();
      },
      toggleSubscription: (id: string) => dispatch({ type: 'subscription/toggle', id }),
      deleteSubscription: (id: string) => dispatch({ type: 'subscription/delete', id }),

      addGoal: (goal: Omit<SavingsGoal, 'id'>) =>
        dispatch({ type: 'goal/add', goal: { ...goal, id: makeId('goal') } }),
      updateGoal: (goal: SavingsGoal) => dispatch({ type: 'goal/update', goal }),
      deleteGoal: (id: string) => dispatch({ type: 'goal/delete', id }),
      moveToGoal: (id: string, amount: number) => dispatch({ type: 'goal/deposit', id, amount }),
      withdrawFromGoal: (id: string, amount: number) => dispatch({ type: 'goal/withdraw', id, amount }),

      deleteHistoryMonth: (id: string) => dispatch({ type: 'history/delete', id }),
      setDiscordWebhook: (webhookUrl: string) => dispatch({ type: 'set-discord', webhookUrl }),
      setDiscordAutoPing: (autoPing: boolean) => dispatch({ type: 'set-discord', autoPing }),
    }),
    [dispatch]
  );

  const applyDecision = useCallback(
    (action: SimulatorAction) => {
      dispatch({
        type: 'decision/apply',
        action,
        idSeed: makeId('d'),
        dailyBurn: Math.round(financials.freeDailyAllowance * 0.9),
      });
      notify('Decision applied to your real budget.', 'success');
    },
    [dispatch, financials.freeDailyAllowance, notify]
  );

  const endMonth = useCallback(
    (newBudget: number, carryOverBalance: boolean) => {
      const now = new Date();
      const categorySpending: Record<string, number> = {};
      for (const c of financials.categoryBreakdown) categorySpending[c.category] = c.amount;
      const archive: MonthArchive = {
        id: makeId('archive'),
        monthName: MONTHS[now.getMonth()],
        year: now.getFullYear(),
        totalIncome: financials.totalIncome,
        totalSpent: financials.totalSpentOverall,
        totalSaved: financials.totalMovedToSavings,
        endingBalance: financials.remainingBalance,
        finalHealthScore: financials.healthScore,
        finalRiskScore: financials.riskScore,
        dailyAllowanceAverage: financials.freeDailyAllowance,
        categorySpending,
        completedDate: now.toISOString().split('T')[0],
      };
      dispatch({
        type: 'month/end',
        archive,
        newBudget,
        carryOver: carryOverBalance ? Math.max(0, financials.remainingBalance) : 0,
      });
      soundEffects.playCelebration();
      notify(`Month banked. New budget of ₹${newBudget.toLocaleString('en-IN')} starts at Day 1.`, 'success');
    },
    [dispatch, financials, notify]
  );

  return { toggleTheme, setDay, togglePanic, toggleSound, exportCSV, exportJSON, importJSON, reset, applyDecision, endMonth, ...handlers };
}
