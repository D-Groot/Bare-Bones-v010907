import { describe, it, expect } from 'vitest';
import { budgetReducer } from '../state/budgetReducer';
import { INITIAL_FINANCIAL_STATE as S } from '../utils/storage';
import type { Expense } from '../types/finance';

const exp = (over: Partial<Expense> = {}): Expense => ({
  id: 'e-new', title: 'Test', amount: 100, category: 'Other', dayLogged: 7, dateString: 'Day 7', ...over,
});

describe('budgetReducer', () => {
  it('adds, updates and deletes expenses immutably', () => {
    const added = budgetReducer(S, { type: 'expense/add', expense: exp() });
    expect(added.expenses[0].id).toBe('e-new');
    expect(S.expenses.find((e) => e.id === 'e-new')).toBeUndefined();
    const updated = budgetReducer(added, { type: 'expense/update', expense: exp({ amount: 5 }) });
    expect(updated.expenses[0].amount).toBe(5);
    const removed = budgetReducer(updated, { type: 'expense/delete', id: 'e-new' });
    expect(removed.expenses.length).toBe(S.expenses.length);
  });

  it('clamps the current day to 1..30', () => {
    expect(budgetReducer(S, { type: 'set-day', day: 99 }).currentDay).toBe(30);
    expect(budgetReducer(S, { type: 'set-day', day: -4 }).currentDay).toBe(1);
  });

  it('never lets a savings goal go below zero on withdraw', () => {
    const id = S.savingsGoals[0].id;
    const next = budgetReducer(S, { type: 'goal/withdraw', id, amount: 1e6 });
    expect(next.savingsGoals[0].currentAmount).toBe(0);
  });

  it('deletes templates', () => {
    const id = S.templates[0].id;
    expect(budgetReducer(S, { type: 'template/delete', id }).templates.some((t) => t.id === id)).toBe(false);
  });

  it('applies a skip_days decision: advances the day and logs daily burn', () => {
    const next = budgetReducer(S, {
      type: 'decision/apply',
      action: { type: 'skip_days', title: '', amount: 0, category: 'Other', daysToSkip: 3 },
      idSeed: 'x',
      dailyBurn: 200,
    });
    expect(next.currentDay).toBe(S.currentDay + 3);
    expect(next.expenses.length).toBe(S.expenses.length + 3);
    expect(next.expenses[0].amount).toBe(200);
  });

  it('ends a month: archives, resets expenses and day', () => {
    const next = budgetReducer(S, {
      type: 'month/end',
      archive: { ...S.history[0], id: 'a-new' },
      newBudget: 8000,
      carryOver: 123,
    });
    expect(next.currentDay).toBe(1);
    expect(next.expenses).toEqual([]);
    expect(next.startingBudget).toBe(8000);
    expect(next.additionalIncome).toBe(123);
    expect(next.history[0].id).toBe('a-new');
  });

  it('toggles panic and theme', () => {
    expect(budgetReducer(S, { type: 'toggle-panic' }).panicModeEnabled).toBe(true);
    expect(budgetReducer({ ...S, theme: 'dark' }, { type: 'toggle-theme' }).theme).toBe('light');
  });
});
