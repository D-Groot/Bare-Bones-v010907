export type Category =
  | 'Housing'
  | 'Food & Drink'
  | 'Transport'
  | 'Utilities'
  | 'Entertainment'
  | 'Health'
  | 'Shopping'
  | 'Education'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  dayLogged: number; // 1 - 30
  dateString: string;
  isUnexpected?: boolean;
}

export interface Template {
  id: string;
  title: string;
  amount: number;
  category: Category;
  icon?: string;
}

export interface Subscription {
  id: string;
  title: string;
  amount: number;
  category: Category;
  dueDay: number;
  isPaid: boolean;
}

export interface FixedCommitment {
  id: string;
  title: string;
  amount: number;
  category: Category;
  dueDay: number;
  isPaid: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export interface MonthArchive {
  id: string;
  monthName: string;
  year: number;
  totalIncome: number;
  totalSpent: number;
  totalSaved: number;
  endingBalance: number;
  finalHealthScore: number;
  finalRiskScore: number;
  dailyAllowanceAverage: number;
  categorySpending: Record<string, number>;
  completedDate: string;
}

export interface FinancialState {
  startingBudget: number; // ₹10,000 base
  additionalIncome: number; // e.g. ₹5,500
  currentDay: number; // 1 - 30
  expenses: Expense[];
  subscriptions: Subscription[];
  fixedCommitments: FixedCommitment[];
  savingsGoals: SavingsGoal[];
  templates: Template[];
  history: MonthArchive[];
  discordWebhookUrl: string;
  discordAutoPing: boolean;
  theme: 'dark' | 'light';
  panicModeEnabled?: boolean;
  soundEnabled?: boolean;
}

export type SimulatorActionType =
  | 'purchase'
  | 'subscription'
  | 'bill'
  | 'surprise'
  | 'savings'
  | 'skip_days';

export interface SimulatorAction {
  type: SimulatorActionType;
  title: string;
  amount: number;
  category: Category;
  daysToSkip?: number;
}
