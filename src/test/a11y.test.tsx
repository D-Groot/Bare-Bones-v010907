import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { Header } from '../components/Header';
import { MetricCards } from '../components/MetricCards';
import { TimelineBar } from '../components/TimelineBar';
import { TabNavigation } from '../components/TabNavigation';
import { computeFinancials } from '../utils/financeCalculators';
import { INITIAL_FINANCIAL_STATE } from '../utils/storage';

describe('Accessibility (axe-core) Audits', () => {
  it('renders Header with no critical accessibility violations', async () => {
    const { container } = render(
      <Header
        theme="dark"
        onToggleTheme={() => {}}
        onOpenDiscord={() => {}}
        onReset={() => {}}
        hasDiscordConfigured={true}
        user={null}
        onLogin={() => {}}
        onLogout={() => {}}
        isSyncing={false}
        panicModeEnabled={false}
        onTogglePanicMode={() => {}}
        soundEnabled={true}
        onToggleSound={() => {}}
        onExportCSV={() => {}}
        onExportJSON={() => {}}
        onImportJSON={() => {}}
      />
    );

    const results = await axe.run(container, {
      rules: {
        'region': { enabled: false },
        'page-has-heading-one': { enabled: false },
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  it('renders TimelineBar with accessible range slider and labels', async () => {
    const { container } = render(
      <TimelineBar currentDay={14} onDayChange={() => {}} />
    );

    const results = await axe.run(container, {
      rules: {
        'region': { enabled: false },
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  it('renders MetricCards with accessible metrics and modal triggers', async () => {
    const financials = computeFinancials(INITIAL_FINANCIAL_STATE);
    const { container } = render(
      <MetricCards financials={financials} panicModeEnabled={false} />
    );

    const results = await axe.run(container, {
      rules: {
        'region': { enabled: false },
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  it('renders TabNavigation with accessible tablist roles and matching tabpanel in DOM', async () => {
    const { container } = render(
      <div>
        <TabNavigation activeTab="Overview" onTabChange={() => {}} />
        <div id="budget-tab-panel" role="tabpanel" aria-labelledby="tab-overview">
          <p>Overview Content</p>
        </div>
      </div>
    );

    const results = await axe.run(container, {
      rules: {
        'region': { enabled: false },
      },
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });
});
