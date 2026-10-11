import React, { useState } from 'react';
import { ComputedFinancials } from '../utils/financeCalculators';

interface OverviewTabProps {
  financials: ComputedFinancials;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ financials }) => {
  const [hoveredForecastDay, setHoveredForecastDay] = useState<number | null>(null);

  // Donut chart calculations
  const totalSpend = financials.totalCategorySpend || 1;
  const categories = financials.categoryBreakdown;

  // Compute SVG Donut paths
  let cumulativeAngle = 0;
  const donutSlices = categories.map((cat) => {
    const angle = (cat.amount / totalSpend) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...cat,
      startAngle,
      angle,
    };
  });

  const formattedTotalK =
    financials.totalCategorySpend >= 1000
      ? `₹${(financials.totalCategorySpend / 1000).toFixed(1)}k`
      : `₹${financials.totalCategorySpend}`;

  // Forecast SVG coordinate scaling
  const forecast = financials.forecastData;
  const maxForecastVal = Math.max(financials.totalIncome, ...forecast.map((f) => f.projectedBalance));
  const svgWidth = 400;
  const svgHeight = 120;
  const paddingX = 15;
  const paddingY = 15;

  const getPoints = () => {
    return forecast.map((pt, idx) => {
      const x = paddingX + (idx / (forecast.length - 1)) * (svgWidth - paddingX * 2);
      const ratio = maxForecastVal > 0 ? pt.projectedBalance / maxForecastVal : 0;
      const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
      return { x, y, ...pt };
    });
  };

  const forecastPoints = getPoints();
  const linePath = forecastPoints.reduce(
    (acc, curr, i) => (i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
    ''
  );
  const areaPath = `${linePath} L ${svgWidth - paddingX} ${svgHeight} L ${paddingX} ${svgHeight} Z`;

  // Semicircle Speedometer Gauge Component
  const renderGauge = (score: number, max: number, color: string) => {
    const clamped = Math.min(max, Math.max(0, score));
    const percent = clamped / max;
    const radius = 64;
    const circumference = Math.PI * radius; // Half-circle perimeter
    const strokeDashoffset = circumference * (1 - percent);

    return (
      <div className="relative flex flex-col items-center justify-center">
        <svg viewBox="0 0 160 90" className="w-44 h-24 overflow-visible" aria-hidden="true">
          {/* Background Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Active Colored Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
    );
  };

  const hoveredPt = forecastPoints.find((p) => p.day === hoveredForecastDay);

  return (
    <div className="space-y-6 w-full">
      {/* Runway Alert Banner if burning faster than daily allowance */}
      {financials.projectedZeroDay && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800 dark:text-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">⚠️</span>
            <div>
              <strong className="text-slate-900 dark:text-white block font-semibold">Runway Alert: Projected Zero on Day {financials.projectedZeroDay}</strong>
              <span className="text-amber-700 dark:text-amber-300/90 text-xs">
                Your burn pace of <strong className="font-mono text-slate-900 dark:text-white">₹{financials.burnRatePerDay}/day</strong> exceeds your sustainable daily allowance of <strong className="font-mono text-slate-900 dark:text-white">₹{financials.freeDailyAllowance}</strong>.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/40 font-mono text-xs font-bold text-amber-800 dark:text-amber-300 shrink-0">
            {financials.daysUntilBroke} Days Runway
          </span>
        </div>
      )}

      {/* Top 2 Cards: Donut Breakdown & 30-Day Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Where it goes */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Where it goes</h3>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90" aria-label="Spending Breakdown Donut Chart">
                {donutSlices.map((slice, idx) => {
                  const rOuter = 82;
                  const rInner = 56;
                  const startRad = (slice.startAngle * Math.PI) / 180;
                  const endRad = ((slice.startAngle + slice.angle - 0.5) * Math.PI) / 180;

                  const x1 = 100 + rOuter * Math.cos(startRad);
                  const y1 = 100 + rOuter * Math.sin(startRad);
                  const x2 = 100 + rOuter * Math.cos(endRad);
                  const y2 = 100 + rOuter * Math.sin(endRad);

                  const x3 = 100 + rInner * Math.cos(endRad);
                  const y3 = 100 + rInner * Math.sin(endRad);
                  const x4 = 100 + rInner * Math.cos(startRad);
                  const y4 = 100 + rInner * Math.sin(startRad);

                  const largeArcFlag = slice.angle > 180 ? 1 : 0;
                  const pathData = `
                    M ${x1} ${y1}
                    A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2}
                    L ${x3} ${y3}
                    A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4}
                    Z
                  `;

                  return (
                    <path
                      key={idx}
                      d={pathData}
                      fill={slice.color}
                      className="transition-opacity hover:opacity-80 cursor-pointer"
                    >
                      <title>
                        {slice.category}: ₹{slice.amount.toLocaleString('en-IN')} ({slice.percentage}%)
                      </title>
                    </path>
                  );
                })}
              </svg>

              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono">{formattedTotalK}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">spent</span>
              </div>
            </div>

            {/* Category Legend List */}
            <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1">
              {categories.slice(0, 6).map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.category}</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium font-mono tabular-nums">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: 30-day balance forecast */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">30-day balance forecast</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Projected balance after every bill, subscription and expense this month.
            </p>
          </div>

          {/* Interactive Area Chart */}
          <div className="mt-4 relative">
            {hoveredPt && (
              <div className="absolute top-0 right-2 text-xs bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md text-slate-800 dark:text-slate-200 shadow-md">
                Day {hoveredPt.day}: <span className="font-bold text-violet-600 dark:text-violet-400 font-mono tabular-nums">₹{hoveredPt.projectedBalance.toLocaleString('en-IN')}</span>{' '}
                {hoveredPt.isActual ? '(Actual)' : '(Forecast)'}
              </div>
            )}

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-36 overflow-visible"
              onMouseLeave={() => setHoveredForecastDay(null)}
              aria-label="30-Day Balance Trajectory Chart"
            >
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <path d={areaPath} fill="url(#forecastGrad)" />

              {/* Stroke line */}
              <path
                d={linePath}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Current Day Dotted Line */}
              {forecastPoints[financials.currentDay - 1] && (
                <line
                  x1={forecastPoints[financials.currentDay - 1].x}
                  y1={0}
                  x2={forecastPoints[financials.currentDay - 1].x}
                  y2={svgHeight}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Interactive Hit circles */}
              {forecastPoints.map((pt) => (
                <circle
                  key={pt.day}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredForecastDay === pt.day ? 5 : 2}
                  fill={hoveredForecastDay === pt.day ? '#8B5CF6' : '#8B5CF6'}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredForecastDay(pt.day)}
                />
              ))}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 px-1 font-mono">
              <span>Day 1</span>
              <span className="text-violet-600 dark:text-violet-400 font-semibold">Day {financials.currentDay} (Today)</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle 2 Cards: Financial Health & Financial Risk Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Financial health */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Financial health</h3>

          <div className="flex flex-col items-center justify-center my-2">
            {renderGauge(financials.healthScore, 100, '#10B981')}
            <div className="text-center -mt-8">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">{financials.healthScore}</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {financials.healthRating}
              </div>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {financials.healthInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" aria-hidden="true" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Financial risk */}
        <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Financial risk</h3>

          <div className="flex flex-col items-center justify-center my-2">
            {renderGauge(
              financials.riskScore,
              100,
              financials.riskScore <= 30 ? '#10B981' : financials.riskScore <= 60 ? '#F59E0B' : '#EF4444'
            )}
            <div className="text-center -mt-8">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">{financials.riskScore}</div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  financials.riskScore <= 30
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : financials.riskScore <= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {financials.riskRating}
              </div>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {financials.riskInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    financials.riskScore <= 30 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  aria-hidden="true"
                />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Table: Money flow this month */}
      <div className="bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Money flow this month</h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Starting balance + income</span>
            <span className="font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              ₹{financials.totalIncome.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Fixed commitments</span>
            <span className="font-semibold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              ₹{financials.totalFixedCommitments.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Subscriptions</span>
            <span className="font-semibold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              ₹{financials.totalSubscriptions.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Variable spending</span>
            <span className="font-semibold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              ₹{financials.totalVariableSpending.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Unexpected expenses</span>
            <span className="font-semibold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              ₹{financials.totalUnexpected.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Moved to savings</span>
            <span className="font-semibold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              ₹{financials.totalMovedToSavings.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/30 px-3 rounded-xl">
            <span className="font-medium text-slate-900 dark:text-white">Remaining balance</span>
            <span className="font-bold font-mono tabular-nums text-violet-600 dark:text-violet-400">
              ₹{financials.remainingBalance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Still needed for savings goals</span>
            <span className="font-semibold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              ₹{financials.stillNeededForSavings.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-300">Free daily allowance (next 30d avg)</span>
            <span className="font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              ₹{financials.freeDailyAllowance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
