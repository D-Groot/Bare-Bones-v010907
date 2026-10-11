import React from 'react';

export const AppFooter: React.FC = () => (
  <footer className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2">
    <span>Your data is saved on this device and, if you sign in, synced via Firebase.</span>
    <span className="font-mono text-slate-600 dark:text-slate-500">BareBones v2.1 · Gen Z Financial Survival Engine</span>
  </footer>
);
