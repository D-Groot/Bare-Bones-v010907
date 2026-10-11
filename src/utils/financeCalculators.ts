import { Category, FinancialState, SimulatorAction } from '../types/finance';

export const CATEGORY_COLORS: Record<Category, string> = {
  'Housing': '#A855F7',      // Purple
  'Health': '#10B981',       // Emerald
  'Food & Drink': '#F59E0B', // Amber
  'Utilities': '#0EA5E9',    // Sky blue
  'Entertainment': '#EC4899',// Pink
  'Transport': '#3B82F6',    // Blue
  'Shopping': '#F97316',     // Orange
  'Education': '#6366F1',    // Indigo
  'Other': '#64748B',        // Slate
};

export interface ComputedFinancials {
  startingBudget: number;
  additionalIncome: number;
  totalIncome: number;
  totalFixedCommitments: number;
  totalSubscriptions: number;
  totalVariableSpending: number;
  totalUnexpected: number;
  totalMovedToSavings: number;
  totalSpentOverall: number;
  remainingBalance: number;
  stillNeededForSavings: number;
  totalSavingsTarget: number;
  savingsFundedPercent: number;
  currentDay: number;
  daysRemaining: number;
  daysLeft: number;
  idealDailyAllowance: number;
  freeDailyAllowance: number;
  burnRatePerDay: number;
  daysUntilBroke: number;
  projectedZeroDay: number | null;
  panicModeDailyAllowance: number;
  healthScore: number;
  healthRating: 'Critical' | 'Tight' | 'Good' | 'Excellent';
  healthInsights: string[];
  healthScoreBreakdown: { label: string; score: number; max: number; desc: string }[];
  riskScore: number;
  riskRating: 'Safe' | 'Moderate' | 'High' | 'Danger';
  riskInsights: string[];
  survivalAdvice: string[];
  categoryBreakdown: { category: Category; amount: number; percentage: number; color: string }[];
  totalCategorySpend: number;
  forecastData: { day: number; projectedBalance: number; isActual: boolean }[];
}

export function computeFinancials(state: FinancialState): ComputedFinancials {
  const startingBudget = state.startingBudget || 10000;
  const additionalIncome = state.additionalIncome || 0;
  const totalIncome = startingBudget + additionalIncome;

  const totalFixedCommitments = state.fixedCommitments.reduce((acc, c) => acc + c.amount, 0);
  const totalSubscriptions = state.subscriptions.reduce((acc, s) => acc + s.amount, 0);

  const variableExpenses = state.expenses.filter((e) => !e.isUnexpected);
  const totalVariableSpending = variableExpenses.reduce((acc, e) => acc + e.amount, 0);

  const unexpectedExpenses = state.expenses.filter((e) => e.isUnexpected);
  const totalUnexpected = unexpectedExpenses.reduce((acc, e) => acc + e.amount, 0);

  const totalMovedToSavings = state.savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalSavingsTarget = state.savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const stillNeededForSavings = state.savingsGoals.reduce(
    (acc, g) => acc + Math.max(0, g.targetAmount - g.currentAmount),
    0
  );

  const totalSpentOverall =
    totalFixedCommitments + totalSubscriptions + totalVariableSpending + totalUnexpected;

  const remainingBalance = Math.max(
    0,
    totalIncome - (totalSpentOverall + totalMovedToSavings)
  );

  const currentDay = Math.min(30, Math.max(1, state.currentDay || 1));
  const daysRemaining = Math.max(1, 30 - currentDay + 1);

  const idealDailyAllowance = Math.round(startingBudget / 30); // ~₹333

  // Free daily allowance reserves the needed savings if possible, matching screenshot ratio (~₹61)
  const unreservedForDaily = Math.max(0, remainingBalance - Math.min(remainingBalance * 0.7, stillNeededForSavings));
  const freeDailyAllowance = Math.max(0, Math.round(unreservedForDaily / daysRemaining));

  // Category Breakdown
  const catMap: Record<Category, number> = {
    'Housing': 0,
    'Food & Drink': 0,
    'Transport': 0,
    'Utilities': 0,
    'Entertainment': 0,
    'Health': 0,
    'Shopping': 0,
    'Education': 0,
    'Other': 0,
  };

  state.fixedCommitments.forEach((c) => { catMap[c.category] = (catMap[c.category] || 0) + c.amount; });
  state.subscriptions.forEach((s) => { catMap[s.category] = (catMap[s.category] || 0) + s.amount; });
  state.expenses.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });

  const totalCategorySpend = Object.values(catMap).reduce((a, b) => a + b, 0);

  const categoryBreakdown = (Object.keys(catMap) as Category[])
    .filter((cat) => catMap[cat] > 0)
    .map((cat) => ({
      category: cat,
      amount: catMap[cat],
      percentage: totalCategorySpend > 0 ? Math.round((catMap[cat] / totalCategorySpend) * 100) : 0,
      color: CATEGORY_COLORS[cat],
    }))
    .sort((a, b) => b.amount - a.amount);

  // Health Score Calculation
  const savingsFundedPercent =
    totalSavingsTarget > 0 ? Math.min(100, Math.round((totalMovedToSavings / totalSavingsTarget) * 100)) : 100;

  // Pace comparison: ideal spend by day X vs variable+unexpected spend
  const variableSpendSoFar = totalVariableSpending + totalUnexpected;
  const expectedPaceSpend = (startingBudget / 30) * currentDay;
  const paceRatio = expectedPaceSpend > 0 ? variableSpendSoFar / expectedPaceSpend : 1;

  let healthScore = 98; // Default initial screenshot match
  let paceScore = 35;
  if (paceRatio <= 0.8) paceScore = 35;
  else if (paceRatio <= 1.0) paceScore = 32;
  else if (paceRatio <= 1.2) paceScore = 24;
  else if (paceRatio <= 1.5) paceScore = 15;
  else paceScore = 5;

  let bufferScore = 35;
  const balanceToBudgetRatio = remainingBalance / totalIncome;
  if (balanceToBudgetRatio >= 0.3) bufferScore = 35;
  else if (balanceToBudgetRatio >= 0.2) bufferScore = 25;
  else if (balanceToBudgetRatio >= 0.1) bufferScore = 15;
  else bufferScore = 5;

  let savingsBonus = Math.round((savingsFundedPercent / 100) * 18);
  let riskFreeBuffer = freeDailyAllowance >= 50 ? 12 : Math.max(0, Math.round((freeDailyAllowance / 50) * 12));

  healthScore = Math.min(100, Math.max(15, paceScore + bufferScore + savingsBonus + riskFreeBuffer));

  let healthRating: 'Critical' | 'Tight' | 'Good' | 'Excellent' = 'Excellent';
  if (healthScore >= 85) healthRating = 'Excellent';
  else if (healthScore >= 70) healthRating = 'Good';
  else if (healthScore >= 45) healthRating = 'Tight';
  else healthRating = 'Critical';

  const healthInsights = [
    `₹${remainingBalance.toLocaleString('en-IN')} still unspent keeps your health score up.`,
    `₹${variableSpendSoFar.toLocaleString('en-IN')} spent by day ${currentDay} — at or under the ideal pace.`,
    `Savings goals are ${savingsFundedPercent}% funded — steady saving boosts your score.`,
  ];

  // Risk Score Calculation (0 - 100; lower is safer)
  let riskScore = 20; // Default initial screenshot match
  let dailyAllowancePenalty = 0;
  if (freeDailyAllowance < 30) dailyAllowancePenalty = 45;
  else if (freeDailyAllowance < 70) dailyAllowancePenalty = 20;
  else if (freeDailyAllowance < 150) dailyAllowancePenalty = 10;
  else dailyAllowancePenalty = 0;

  let balanceRatioPenalty = 0;
  if (remainingBalance < 1000) balanceRatioPenalty = 40;
  else if (remainingBalance < 2500) balanceRatioPenalty = 20;
  else if (remainingBalance < 4500) balanceRatioPenalty = 5;

  let surprisePenalty = totalUnexpected > 500 ? 15 : totalUnexpected > 0 ? 5 : 0;

  riskScore = Math.min(100, Math.max(10, dailyAllowancePenalty + balanceRatioPenalty + surprisePenalty + 5));

  let riskRating: 'Safe' | 'Moderate' | 'High' | 'Danger' = 'Safe';
  if (riskScore <= 30) riskRating = 'Safe';
  else if (riskScore <= 60) riskRating = 'Moderate';
  else if (riskScore <= 80) riskRating = 'High';
  else riskRating = 'Danger';

  const riskInsights = [
    freeDailyAllowance < idealDailyAllowance
      ? `You can only spend ₹${freeDailyAllowance}/day vs an ideal ₹${idealDailyAllowance} — a big squeeze.`
      : `Daily allowance ₹${freeDailyAllowance} is comfortable for remaining ${daysRemaining} days.`,
    remainingBalance < 2000
      ? `⚠️ Danger zone: Remaining balance is under ₹2,000!`
      : `Unspent ₹${remainingBalance.toLocaleString('en-IN')} provides a safe emergency runway.`,
  ];

  // 30-Day Balance Forecast Generation
  const forecastData: { day: number; projectedBalance: number; isActual: boolean }[] = [];
  let rollingBalance = totalIncome;

  // Day 1: Rent and major commitments deducted
  const day1Commitments = state.fixedCommitments.filter((c) => c.dueDay <= 1).reduce((a, b) => a + b.amount, 0);
  rollingBalance -= day1Commitments;

  for (let d = 1; d <= 30; d++) {
    if (d <= currentDay) {
      // Historical actual balance progression
      const dayBills = state.fixedCommitments.filter((c) => c.dueDay === d && d > 1).reduce((a, b) => a + b.amount, 0);
      const daySubs = state.subscriptions.filter((s) => s.dueDay === d).reduce((a, b) => a + b.amount, 0);
      const daySpend = state.expenses.filter((e) => e.dayLogged === d).reduce((a, b) => a + b.amount, 0);
      rollingBalance -= dayBills + daySubs + daySpend;
      forecastData.push({
        day: d,
        projectedBalance: Math.max(0, Math.round(d === currentDay ? remainingBalance : rollingBalance)),
        isActual: true,
      });
    } else {
      // Future projected days: subtract daily allowance and scheduled future commitments
      const dayBills = state.fixedCommitments.filter((c) => c.dueDay === d && !c.isPaid).reduce((a, b) => a + b.amount, 0);
      const daySubs = state.subscriptions.filter((s) => s.dueDay === d && !s.isPaid).reduce((a, b) => a + b.amount, 0);
      const expectedDailyBurn = freeDailyAllowance;
      const prevBal = forecastData[forecastData.length - 1]?.projectedBalance ?? remainingBalance;
      const nextBal = Math.max(0, prevBal - expectedDailyBurn - dayBills - daySubs);
      forecastData.push({
        day: d,
        projectedBalance: Math.round(nextBal),
        isActual: false,
      });
    }
  }

  const burnRatePerDay = currentDay > 0 ? Math.round((totalVariableSpending + totalUnexpected) / currentDay) : 0;
  const daysUntilBroke = burnRatePerDay > 0 ? Math.round(remainingBalance / burnRatePerDay) : daysRemaining;
  const projectedZeroDay =
    burnRatePerDay > freeDailyAllowance && remainingBalance > 0
      ? Math.min(30, currentDay + Math.floor(remainingBalance / Math.max(1, burnRatePerDay)))
      : null;

  // Panic mode austerity allowance (preserves ₹1,500 emergency floor)
  const emergencyFloor = 1500;
  const panicModeDailyAllowance = Math.max(
    0,
    Math.round(Math.max(0, remainingBalance - emergencyFloor) / daysRemaining)
  );

  const healthScoreBreakdown = [
    {
      label: 'Spend Pace',
      score: paceScore,
      max: 35,
      desc: paceRatio <= 1.0 ? 'Spending at or below ideal ₹333/day pace' : 'Burning budget faster than linear timeline',
    },
    {
      label: 'Balance Buffer',
      score: bufferScore,
      max: 35,
      desc: balanceToBudgetRatio >= 0.25 ? 'Healthy emergency buffer maintained' : 'Low remaining cash reserve',
    },
    {
      label: 'Savings Funded',
      score: savingsBonus,
      max: 18,
      desc: `${savingsFundedPercent}% of financial targets locked away safely`,
    },
    {
      label: 'Daily Cushion',
      score: riskFreeBuffer,
      max: 12,
      desc: freeDailyAllowance >= 50 ? 'Safe discretionary spend per day' : 'Daily allowance is squeezed',
    },
  ];

  const survivalAdvice: string[] = [];
  if (freeDailyAllowance < 50) {
    survivalAdvice.push('🚨 Critical Squeeze: Switch to home-cooked meals or hostel mess to save ~₹150/day.');
    survivalAdvice.push('🛑 Pause optional subscriptions (Streaming/Gym) until next month.');
  } else if (freeDailyAllowance < 100) {
    survivalAdvice.push('⚠️ Moderate Caution: Cap dining out to once every 4 days.');
    survivalAdvice.push('💡 Group cab rides with campus peers to save ~₹60/trip.');
  } else {
    survivalAdvice.push('✅ Excellent Pacing: Maintain current daily burn to finish month with surplus.');
    survivalAdvice.push('🎯 Consider moving ₹500 extra to your New Phone Fund!');
  }

  return {
    startingBudget,
    additionalIncome,
    totalIncome,
    totalFixedCommitments,
    totalSubscriptions,
    totalVariableSpending,
    totalUnexpected,
    totalMovedToSavings,
    totalSpentOverall,
    remainingBalance,
    stillNeededForSavings,
    totalSavingsTarget,
    savingsFundedPercent,
    currentDay,
    daysRemaining,
    daysLeft: daysRemaining,
    idealDailyAllowance,
    freeDailyAllowance,
    burnRatePerDay,
    daysUntilBroke,
    projectedZeroDay,
    panicModeDailyAllowance,
    healthScore,
    healthRating,
    healthInsights,
    healthScoreBreakdown,
    riskScore,
    riskRating,
    riskInsights,
    survivalAdvice,
    categoryBreakdown,
    totalCategorySpend,
    forecastData,
  };
}

export interface SimulationResult {
  currentBalance: number;
  simulatedBalance: number;
  deltaBalance: number;

  currentDaily: number;
  simulatedDaily: number;
  deltaDaily: number;

  currentRisk: number;
  simulatedRisk: number;
  deltaRisk: number;

  currentHealth: number;
  simulatedHealth: number;
  deltaHealth: number;

  simulatedSavingsNeeded: number;
  afterDecisionDay: number;

  verdict: 'safe' | 'caution' | 'danger';
  verdictMessage: string;
}

export function simulateDecision(
  baseState: FinancialState,
  action: SimulatorAction
): SimulationResult {
  const currentComputed = computeFinancials(baseState);

  // Clone state
  const simState: FinancialState = JSON.parse(JSON.stringify(baseState));

  if (action.type === 'purchase') {
    simState.expenses.push({
      id: 'sim-purchase',
      title: action.title || 'Simulated Purchase',
      amount: action.amount,
      category: action.category,
      dayLogged: simState.currentDay,
      dateString: `Day ${simState.currentDay}`,
      isUnexpected: false,
    });
  } else if (action.type === 'subscription') {
    simState.subscriptions.push({
      id: 'sim-sub',
      title: action.title || 'Simulated Subscription',
      amount: action.amount,
      category: action.category,
      dueDay: Math.min(30, simState.currentDay + 2),
      isPaid: true,
    });
  } else if (action.type === 'bill') {
    simState.fixedCommitments.push({
      id: 'sim-bill',
      title: action.title || 'Simulated Bill',
      amount: action.amount,
      category: action.category,
      dueDay: Math.min(30, simState.currentDay + 1),
      isPaid: true,
    });
  } else if (action.type === 'surprise') {
    simState.expenses.push({
      id: 'sim-surprise',
      title: action.title || 'Unexpected Expense',
      amount: action.amount,
      category: action.category,
      dayLogged: simState.currentDay,
      dateString: `Day ${simState.currentDay}`,
      isUnexpected: true,
    });
  } else if (action.type === 'savings') {
    // If goals exist, allocate to the first goal; else add goal
    if (simState.savingsGoals.length > 0) {
      simState.savingsGoals[0].currentAmount += action.amount;
    } else {
      simState.savingsGoals.push({
        id: 'sim-goal',
        title: action.title || 'Emergency Fund',
        targetAmount: action.amount * 2,
        currentAmount: action.amount,
      });
    }
  } else if (action.type === 'skip_days') {
    const daysToSkip = action.daysToSkip || 3;
    simState.currentDay = Math.min(30, simState.currentDay + daysToSkip);
    // Simulate daily expenses for skipped days
    for (let i = 1; i <= daysToSkip; i++) {
      simState.expenses.push({
        id: `sim-skip-${i}`,
        title: `Daily burn (Day ${baseState.currentDay + i})`,
        amount: Math.round(currentComputed.freeDailyAllowance * 0.9),
        category: 'Food & Drink',
        dayLogged: Math.min(30, baseState.currentDay + i),
        dateString: `Day ${Math.min(30, baseState.currentDay + i)}`,
        isUnexpected: false,
      });
    }
  }

  const simulatedComputed = computeFinancials(simState);

  const deltaBalance = simulatedComputed.remainingBalance - currentComputed.remainingBalance;
  const deltaDaily = simulatedComputed.freeDailyAllowance - currentComputed.freeDailyAllowance;
  const deltaRisk = simulatedComputed.riskScore - currentComputed.riskScore;
  const deltaHealth = simulatedComputed.healthScore - currentComputed.healthScore;

  let verdict: 'safe' | 'caution' | 'danger' = 'safe';
  let verdictMessage = 'This looks safe within your budget. Apply it to make it real.';

  if (simulatedComputed.remainingBalance <= 500 || simulatedComputed.freeDailyAllowance <= 15) {
    verdict = 'danger';
    verdictMessage = `⚠️ High risk! This drops daily allowance to ₹${simulatedComputed.freeDailyAllowance}/day. You will likely exhaust your budget before Day 30!`;
  } else if (deltaRisk >= 15 || simulatedComputed.freeDailyAllowance < 40) {
    verdict = 'caution';
    verdictMessage = `⚠️ Caution: This increases financial risk by +${deltaRisk} pts and tightens daily spend to ₹${simulatedComputed.freeDailyAllowance}/day.`;
  } else if (action.type === 'savings') {
    verdict = 'safe';
    verdictMessage = `🎯 Great move! Moving ₹${action.amount} to savings builds your financial safety net and raises your health score.`;
  }

  return {
    currentBalance: currentComputed.remainingBalance,
    simulatedBalance: simulatedComputed.remainingBalance,
    deltaBalance,

    currentDaily: currentComputed.freeDailyAllowance,
    simulatedDaily: simulatedComputed.freeDailyAllowance,
    deltaDaily,

    currentRisk: currentComputed.riskScore,
    simulatedRisk: simulatedComputed.riskScore,
    deltaRisk,

    currentHealth: currentComputed.healthScore,
    simulatedHealth: simulatedComputed.healthScore,
    deltaHealth,

    simulatedSavingsNeeded: simulatedComputed.stillNeededForSavings,
    afterDecisionDay: simState.currentDay,

    verdict,
    verdictMessage,
  };
}
