import { describe, it, expect } from 'vitest';
import {
  computeFinancials,
  simulateDecision,
} from '../utils/financeCalculators';
import { INITIAL_FINANCIAL_STATE } from '../utils/storage';
import { SimulatorAction } from '../types/finance';

describe('Financial Calculation Engine Tests', () => {
  it('correctly calculates baseline metrics on ₹10,000 budget', () => {
    const financials = computeFinancials(INITIAL_FINANCIAL_STATE);

    expect(financials.startingBudget).toBe(10000);
    expect(financials.totalIncome).toBe(15500); // 10000 + 5500 additional income
    expect(financials.currentDay).toBe(INITIAL_FINANCIAL_STATE.currentDay);
    expect(financials.daysLeft).toBe(30 - INITIAL_FINANCIAL_STATE.currentDay + 1);

    // Remaining balance must equal totalIncome - totalSpent - savings
    expect(financials.remainingBalance).toBe(
      financials.totalIncome - financials.totalSpentOverall - financials.totalMovedToSavings
    );

    // Free daily allowance must be positive
    expect(financials.freeDailyAllowance).toBeGreaterThan(0);
    // Health score must be clamped between 0 and 100
    expect(financials.healthScore).toBeGreaterThanOrEqual(0);
    expect(financials.healthScore).toBeLessThanOrEqual(100);
    // Risk score must be clamped between 0 and 100
    expect(financials.riskScore).toBeGreaterThanOrEqual(0);
    expect(financials.riskScore).toBeLessThanOrEqual(100);
  });

  it('correctly factors in panic mode daily allowance', () => {
    const financials = computeFinancials(INITIAL_FINANCIAL_STATE);
    // Panic mode locks emergency buffer and divides balance strictly by remaining days
    expect(financials.panicModeDailyAllowance).toBeGreaterThan(0);
    expect(typeof financials.panicModeDailyAllowance).toBe('number');
  });

  it('generates accurate 30-day forecast trajectory', () => {
    const financials = computeFinancials(INITIAL_FINANCIAL_STATE);
    expect(financials.forecastData).toHaveLength(30);
    expect(financials.forecastData[0].day).toBe(1);
    expect(financials.forecastData[29].day).toBe(30);
  });

  it('simulates a high-cost impulse purchase and generates caution or danger verdict', () => {
    const action: SimulatorAction = {
      type: 'purchase',
      title: 'Sneakers',
      amount: 4000,
      category: 'Shopping',
    };

    const sim = simulateDecision(INITIAL_FINANCIAL_STATE, action);

    // Balance should decrease by exactly 4000
    expect(sim.simulatedBalance).toBe(sim.currentBalance - 4000);
    // Daily allowance should decrease
    expect(sim.deltaDaily).toBeLessThan(0);
    // Health score should drop
    expect(sim.deltaHealth).toBeLessThanOrEqual(0);
    // Risk score should increase or stay high
    expect(sim.deltaRisk).toBeGreaterThanOrEqual(0);
    // Should have verdict message
    expect(sim.verdictMessage).toBeDefined();
    expect(sim.verdict).toMatch(/warning|danger|caution/);
  });

  it('simulates a savings stash deposit and adjusts balance', () => {
    const action: SimulatorAction = {
      type: 'savings',
      title: 'Emergency Fund',
      amount: 1000,
      category: 'Other',
    };

    const sim = simulateDecision(INITIAL_FINANCIAL_STATE, action);

    expect(sim.simulatedBalance).toBe(sim.currentBalance - 1000);
    expect(sim.verdict).toBe('safe');
    expect(sim.verdictMessage).toContain('savings');
  });
});
