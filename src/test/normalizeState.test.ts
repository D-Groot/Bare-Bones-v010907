import { describe, it, expect } from 'vitest';
import { normalizeState } from '../state/normalizeState';
import { INITIAL_FINANCIAL_STATE as S } from '../utils/storage';
import { csvCell, buildExpensesCSV } from '../utils/exportImport';

describe('normalizeState', () => {
  it('round-trips a valid state', () => {
    const out = normalizeState(JSON.parse(JSON.stringify(S)), S);
    expect(out?.expenses.length).toBe(S.expenses.length);
    expect(out?.startingBudget).toBe(10000);
  });

  it('rejects non-budget input', () => {
    expect(normalizeState(null, S)).toBeNull();
    expect(normalizeState([], S)).toBeNull();
    expect(normalizeState({ startingBudget: '10' }, S)).toBeNull();
  });

  it('clamps days, drops invalid rows and falls back on unknown categories', () => {
    const out = normalizeState(
      {
        ...S,
        currentDay: 400,
        expenses: [
          { id: 'ok', title: 'x', amount: 5, category: 'Nope', dayLogged: -2 },
          { title: 'no id', amount: 1 },
          'junk',
        ],
      },
      S
    );
    expect(out?.currentDay).toBe(30);
    expect(out?.expenses).toHaveLength(1);
    expect(out?.expenses[0].category).toBe('Other');
    expect(out?.expenses[0].dayLogged).toBe(1);
  });

  it('strips non-Discord webhook URLs and coerces bad numbers', () => {
    const out = normalizeState({ ...S, discordWebhookUrl: 'https://evil.example/hook', additionalIncome: Infinity }, S);
    expect(out?.discordWebhookUrl).toBe('');
    expect(out?.additionalIncome).toBe(0);
  });

  it('keeps a genuine Discord webhook URL', () => {
    const url = 'https://discord.com/api/webhooks/1/abc';
    expect(normalizeState({ ...S, discordWebhookUrl: url }, S)?.discordWebhookUrl).toBe(url);
  });
});

describe('CSV export safety', () => {
  it('neutralises spreadsheet formulas', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+1')).toBe(`"'+1"`);
    expect(csvCell('plain')).toBe('"plain"');
  });
  it('builds a header plus one row per expense', () => {
    expect(buildExpensesCSV(S.expenses).split('\n')).toHaveLength(S.expenses.length + 1);
  });
});
