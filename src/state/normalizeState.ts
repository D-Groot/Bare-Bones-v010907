import { CATEGORIES, MONTH_DAYS, isDiscordWebhookUrl } from '../constants';
import type {
  Category,
  Expense,
  FinancialState,
  FixedCommitment,
  MonthArchive,
  SavingsGoal,
  Subscription,
  Template,
} from '../types/finance';

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const MAX_TEXT = 80;

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, MAX_TEXT) : fallback;
}
function money(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number.NaN;
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 1e9) : fallback;
}
function day(v: unknown, fallback = 1): number {
  const n = typeof v === 'number' ? Math.round(v) : Number.NaN;
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), MONTH_DAYS) : fallback;
}
function category(v: unknown): Category {
  return CATEGORIES.includes(v as Category) ? (v as Category) : 'Other';
}
function list<T>(v: unknown, map: (raw: Raw) => T | null): T[] | null {
  if (!Array.isArray(v)) return null;
  return v.filter(isObj).map(map).filter((x): x is T => x !== null);
}

const expense = (r: Raw): Expense | null => {
  const id = str(r.id);
  if (!id) return null;
  const d = day(r.dayLogged);
  return {
    id,
    title: str(r.title, 'Expense') || 'Expense',
    amount: money(r.amount),
    category: category(r.category),
    dayLogged: d,
    dateString: str(r.dateString, `Day ${d}`) || `Day ${d}`,
    isUnexpected: r.isUnexpected === true,
  };
};
const recurring = (r: Raw): (Subscription & FixedCommitment) | null => {
  const id = str(r.id);
  if (!id) return null;
  return {
    id,
    title: str(r.title, 'Item') || 'Item',
    amount: money(r.amount),
    category: category(r.category),
    dueDay: day(r.dueDay),
    isPaid: r.isPaid === true,
  };
};
const goal = (r: Raw): SavingsGoal | null => {
  const id = str(r.id);
  if (!id) return null;
  return {
    id,
    title: str(r.title, 'Goal') || 'Goal',
    targetAmount: money(r.targetAmount),
    currentAmount: money(r.currentAmount),
  };
};
const template = (r: Raw): Template | null => {
  const id = str(r.id);
  if (!id) return null;
  return {
    id,
    title: str(r.title, 'Template') || 'Template',
    amount: money(r.amount),
    category: category(r.category),
  };
};
const archive = (r: Raw): MonthArchive | null => {
  const id = str(r.id);
  if (!id) return null;
  const spending: Record<string, number> = {};
  if (isObj(r.categorySpending)) {
    for (const [k, v] of Object.entries(r.categorySpending)) spending[str(k)] = money(v);
  }
  return {
    id,
    monthName: str(r.monthName, 'Month'),
    year: typeof r.year === 'number' ? Math.round(r.year) : new Date().getFullYear(),
    totalIncome: money(r.totalIncome),
    totalSpent: money(r.totalSpent),
    totalSaved: money(r.totalSaved),
    endingBalance: typeof r.endingBalance === 'number' && Number.isFinite(r.endingBalance) ? r.endingBalance : 0,
    finalHealthScore: money(r.finalHealthScore),
    finalRiskScore: money(r.finalRiskScore),
    dailyAllowanceAverage: money(r.dailyAllowanceAverage),
    categorySpending: spending,
    completedDate: str(r.completedDate),
  };
};

/**
 * Coerces untrusted input (localStorage, Firestore, imported JSON) into a valid
 * FinancialState. Returns null when the input is not recognisably a budget.
 * Missing optional sections fall back to `defaults`.
 */
export function normalizeState(input: unknown, defaults: FinancialState): FinancialState | null {
  if (!isObj(input)) return null;
  const expenses = list(input.expenses, expense);
  const fixed = list(input.fixedCommitments, recurring);
  if (typeof input.startingBudget !== 'number' || !expenses || !fixed) return null;

  const webhook = typeof input.discordWebhookUrl === 'string' ? input.discordWebhookUrl.trim() : '';
  return {
    startingBudget: money(input.startingBudget, defaults.startingBudget),
    additionalIncome: money(input.additionalIncome, 0),
    currentDay: day(input.currentDay, defaults.currentDay),
    expenses,
    fixedCommitments: fixed,
    subscriptions: list(input.subscriptions, recurring) ?? defaults.subscriptions,
    savingsGoals: list(input.savingsGoals, goal) ?? defaults.savingsGoals,
    templates: list(input.templates, template) ?? defaults.templates,
    history: list(input.history, archive) ?? defaults.history,
    discordWebhookUrl: isDiscordWebhookUrl(webhook) && webhook.length < 300 ? webhook : '',
    discordAutoPing: input.discordAutoPing === true,
    theme: input.theme === 'light' ? 'light' : 'dark',
    panicModeEnabled: input.panicModeEnabled === true,
    soundEnabled: input.soundEnabled !== false,
  };
}
