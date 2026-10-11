import type { FinancialState, Expense } from '../types/finance';
import { normalizeState } from '../state/normalizeState';
import { INITIAL_FINANCIAL_STATE } from './storage';

/** Quotes a CSV cell and neutralises spreadsheet formula injection (=, +, -, @, tab, CR prefixes). */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildExpensesCSV(expenses: Expense[]): string {
  const headers = ['ID', 'Title', 'Amount (INR)', 'Category', 'Day', 'Type', 'Date'];
  const rows = expenses.map((e) => [
    csvCell(e.id),
    csvCell(e.title),
    e.amount,
    csvCell(e.category),
    e.dayLogged,
    e.isUnexpected ? 'Unexpected Emergency' : 'Variable Discretionary',
    csvCell(e.dateString || `Day ${e.dayLogged}`),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportExpensesToCSV(expenses: Expense[], currentDay: number): void {
  const csvContent = buildExpensesCSV(expenses);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `barebones_budget_day${currentDay}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBackupJSON(state: FinancialState): void {
  const jsonContent = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `barebones_state_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateAndParseBackup(rawText: string): FinancialState | null {
  try {
    return normalizeState(JSON.parse(rawText), INITIAL_FINANCIAL_STATE);
  } catch {
    return null;
  }
}
