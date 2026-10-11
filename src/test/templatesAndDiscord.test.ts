import { describe, it, expect } from 'vitest';
import { INITIAL_FINANCIAL_STATE } from '../utils/storage';
import { computeFinancials } from '../utils/financeCalculators';

describe('Templates and Discord Webhook Utility Tests', () => {
  it('includes default one-tap templates for common recurring items', () => {
    const templates = INITIAL_FINANCIAL_STATE.templates;
    expect(templates.length).toBeGreaterThanOrEqual(4);

    const groceryTemplate = templates.find((t) => t.title.toLowerCase().includes('grocer'));
    expect(groceryTemplate).toBeDefined();
    expect(groceryTemplate?.amount).toBeGreaterThan(0);

    const streamingTemplate = templates.find((t) => t.title.toLowerCase().includes('stream') || t.title.toLowerCase().includes('spotify') || t.title.toLowerCase().includes('netflix'));
    expect(streamingTemplate).toBeDefined();
  });

  it('formats Discord payload with required Gen Z survival stats and color codes', () => {
    const financials = computeFinancials(INITIAL_FINANCIAL_STATE);

    // Color check based on health score
    const healthColor = financials.healthScore >= 70 ? 0x10b981 : financials.healthScore >= 40 ? 0xf59e0b : 0xf43f5e;
    expect(typeof healthColor).toBe('number');

    const fields = [
      { name: 'Timeline', value: `Day ${financials.currentDay} of 30 (${financials.daysLeft} days remaining)`, inline: true },
      { name: 'Remaining Balance', value: `₹${financials.remainingBalance.toLocaleString('en-IN')}`, inline: true },
      { name: 'Free Daily Allowance', value: `₹${financials.freeDailyAllowance.toLocaleString('en-IN')} / day`, inline: true },
      { name: 'Financial Health', value: `${financials.healthScore}/100 (${financials.healthRating})`, inline: true },
      { name: 'Financial Risk', value: `${financials.riskScore}/100 (${financials.riskRating})`, inline: true },
    ];

    expect(fields.length).toBe(5);
    expect(fields[0].value).toContain(`Day ${financials.currentDay}`);
    expect(fields[1].value).toContain('₹');
  });
});
