import React from 'react';

export type TabKey = 'Overview' | 'Spending' | 'Bills & Subs' | 'Savings' | 'Simulator' | 'History';

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: TabKey[] = ['Overview', 'Spending', 'Bills & Subs', 'Savings', 'Simulator', 'History'];

  return (
    <nav aria-label="Budget Sections" className="w-full overflow-x-auto no-scrollbar py-1">
      <div
        role="tablist"
        aria-label="Budget Navigation Tabs"
        className="inline-flex items-center gap-1.5 p-1 bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl min-w-max shadow-sm"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const tabSlug = tab.toLowerCase().replace(/[^a-z0-9]/g, '-');
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`tab-${tabSlug}`}
              aria-selected={isActive}
              aria-controls={isActive ? 'budget-tab-panel' : undefined}
              onClick={() => onTabChange(tab)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-violet-600 text-white font-semibold shadow-sm shadow-violet-900/40 ring-1 ring-violet-400/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
