import { describe, it, expect } from 'vitest';
import { validateAndParseBackup } from '../utils/exportImport';
import { INITIAL_FINANCIAL_STATE } from '../utils/storage';

describe('Data Import & Export Validation', () => {
  it('validates and parses a valid JSON backup', () => {
    const jsonStr = JSON.stringify(INITIAL_FINANCIAL_STATE);
    const parsed = validateAndParseBackup(jsonStr);

    expect(parsed).not.toBeNull();
    expect(parsed?.startingBudget).toBe(10000);
    expect(parsed?.expenses.length).toBeGreaterThan(0);
  });

  it('rejects corrupted or malicious JSON backup gracefully', () => {
    const invalidJson = '{"notAValidState": true}';
    const parsed = validateAndParseBackup(invalidJson);
    expect(parsed).toBeNull();

    const malformed = '{ corrupt json';
    const parsedMalformed = validateAndParseBackup(malformed);
    expect(parsedMalformed).toBeNull();
  });
});
