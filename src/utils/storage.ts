import type { FinancialState, MonthArchive } from '../types/finance';
import { normalizeState } from '../state/normalizeState';

export const INITIAL_MONTH_HISTORY: MonthArchive[] = [
  {
    id: 'month-aug-2026',
    monthName: 'August',
    year: 2026,
    totalIncome: 15000,
    totalSpent: 9800,
    totalSaved: 3500,
    endingBalance: 1700,
    finalHealthScore: 88,
    finalRiskScore: 28,
    dailyAllowanceAverage: 85,
    categorySpending: {
      'Housing': 4500,
      'Food & Drink': 2400,
      'Transport': 950,
      'Utilities': 600,
      'Entertainment': 750,
      'Other': 600,
    },
    completedDate: '2026-08-31',
  },
  {
    id: 'month-sep-2026',
    monthName: 'September',
    year: 2026,
    totalIncome: 15500,
    totalSpent: 8900,
    totalSaved: 4200,
    endingBalance: 2400,
    finalHealthScore: 92,
    finalRiskScore: 22,
    dailyAllowanceAverage: 110,
    categorySpending: {
      'Housing': 4500,
      'Food & Drink': 1900,
      'Transport': 800,
      'Utilities': 600,
      'Entertainment': 600,
      'Health': 500,
    },
    completedDate: '2026-09-30',
  },
];

export const INITIAL_FINANCIAL_STATE: FinancialState = {
  startingBudget: 10000,
  additionalIncome: 5500,
  currentDay: 7,
  expenses: [
    {
      id: 'exp-1',
      title: 'Zomato late-night order',
      amount: 280,
      category: 'Food & Drink',
      dayLogged: 7,
      dateString: 'Day 7',
      isUnexpected: false,
    },
    {
      id: 'exp-2',
      title: 'Movie night',
      amount: 250,
      category: 'Entertainment',
      dayLogged: 6,
      dateString: 'Day 6',
      isUnexpected: false,
    },
    {
      id: 'exp-3',
      title: 'Chai + samosa',
      amount: 60,
      category: 'Food & Drink',
      dayLogged: 4,
      dateString: 'Day 4',
      isUnexpected: false,
    },
    {
      id: 'exp-4',
      title: 'Uber to campus',
      amount: 120,
      category: 'Transport',
      dayLogged: 3,
      dateString: 'Day 3',
      isUnexpected: false,
    },
    {
      id: 'exp-5',
      title: 'Swiggy dinner',
      amount: 340,
      category: 'Food & Drink',
      dayLogged: 2,
      dateString: 'Day 2',
      isUnexpected: false,
    },
    {
      id: 'exp-6',
      title: 'Emergency med strip',
      amount: 280,
      category: 'Health',
      dayLogged: 5,
      dateString: 'Day 5',
      isUnexpected: true, // Unexpected expense ₹280
    },
  ],
  subscriptions: [
    {
      id: 'sub-1',
      title: 'Streaming pass (Netflix)',
      amount: 199,
      category: 'Entertainment',
      dueDay: 10,
      isPaid: true,
    },
    {
      id: 'sub-2',
      title: 'Spotify Premium Student',
      amount: 119,
      category: 'Entertainment',
      dueDay: 15,
      isPaid: true,
    },
  ],
  fixedCommitments: [
    {
      id: 'fix-1',
      title: 'Shared flat rent',
      amount: 4500,
      category: 'Housing',
      dueDay: 1,
      isPaid: true,
    },
    {
      id: 'fix-2',
      title: 'High-speed broadband',
      amount: 599,
      category: 'Utilities',
      dueDay: 5,
      isPaid: true,
    },
    {
      id: 'fix-3',
      title: 'Health club / gym dues',
      amount: 500,
      category: 'Health',
      dueDay: 12,
      isPaid: true,
    },
  ],
  savingsGoals: [
    {
      id: 'goal-1',
      title: 'Concert ticket',
      targetAmount: 2500,
      currentAmount: 1500,
    },
    {
      id: 'goal-2',
      title: 'New phone fund',
      targetAmount: 3000,
      currentAmount: 1500,
    },
  ],
  templates: [
    {
      id: 'tpl-1',
      title: 'Groceries',
      amount: 400,
      category: 'Food & Drink',
    },
    {
      id: 'tpl-2',
      title: 'Streaming',
      amount: 199,
      category: 'Entertainment',
    },
    {
      id: 'tpl-3',
      title: 'Coffee run',
      amount: 80,
      category: 'Food & Drink',
    },
    {
      id: 'tpl-4',
      title: 'Cab ride',
      amount: 120,
      category: 'Transport',
    },
  ],
  history: INITIAL_MONTH_HISTORY,
  discordWebhookUrl: '',
  discordAutoPing: false,
  theme: 'dark',
  panicModeEnabled: false,
  soundEnabled: true,
};

const STORAGE_KEY = 'barebones_finance_state_v1';

export function loadFinancialState(): FinancialState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_FINANCIAL_STATE;
    return normalizeState(JSON.parse(raw), INITIAL_FINANCIAL_STATE) ?? INITIAL_FINANCIAL_STATE;
  } catch {
    return INITIAL_FINANCIAL_STATE;
  }
}

export function saveFinancialState(state: FinancialState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}
