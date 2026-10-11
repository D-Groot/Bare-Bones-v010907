import { useEffect, useMemo, useReducer } from 'react';
import { budgetReducer } from '../state/budgetReducer';
import { computeFinancials } from '../utils/financeCalculators';
import { loadFinancialState, saveFinancialState } from '../utils/storage';
import { soundEffects } from '../utils/audio';

/** Owns the budget reducer, local persistence, theme class and sound preference. */
export function useBudget() {
  const [state, dispatch] = useReducer(budgetReducer, undefined, loadFinancialState);

  useEffect(() => {
    saveFinancialState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    soundEffects.enabled = state.soundEnabled !== false;
  }, [state.soundEnabled]);

  const financials = useMemo(() => computeFinancials(state), [state]);

  const activeDailyAllowance = state.panicModeEnabled
    ? financials.panicModeDailyAllowance
    : financials.freeDailyAllowance;

  const todaySpent = useMemo(
    () =>
      state.expenses
        .filter((e) => e.dayLogged === state.currentDay)
        .reduce((sum, e) => sum + e.amount, 0),
    [state.expenses, state.currentDay]
  );

  return { state, dispatch, financials, activeDailyAllowance, todaySpent };
}
