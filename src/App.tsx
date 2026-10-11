import React, { Suspense, lazy, useState } from 'react';
import { Header } from './components/Header';
import { TimelineBar } from './components/TimelineBar';
import { MetricCards } from './components/MetricCards';
import { TabNavigation, TabKey } from './components/TabNavigation';
import { TabPanel } from './components/TabPanel';
import { AlertBanners } from './components/AlertBanners';
import { AppFooter } from './components/AppFooter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/Toast';
import { useBudget } from './hooks/useBudget';
import { useBudgetActions } from './hooks/useBudgetActions';
import { useCloudSync } from './hooks/useCloudSync';
import { useConfirm } from './hooks/useConfirm';
import { useToasts } from './hooks/useToasts';

const DiscordModal = lazy(() => import('./components/DiscordModal').then((m) => ({ default: m.DiscordModal })));

export default function App() {
  const { state, dispatch, financials, activeDailyAllowance, todaySpent } = useBudget();
  const { toasts, notify, dismiss } = useToasts();
  const { confirm, options: confirmOptions, settle } = useConfirm();
  const actions = useBudgetActions({ state, financials, dispatch, notify, confirm });
  const cloud = useCloudSync(state, dispatch);

  const [activeTab, setActiveTab] = useState<TabKey>('Overview');
  const [isDiscordOpen, setIsDiscordOpen] = useState(false);

  const handleLogin = () => cloud.login().catch(() => notify('Sign-in failed. Please try again.', 'error'));
  const handleLogout = () => cloud.logout().catch(() => notify('Sign-out failed. Please try again.', 'error'));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white transition-colors duration-150">
        <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col space-y-5">
          <Header
            theme={state.theme}
            onToggleTheme={actions.toggleTheme}
            onOpenDiscord={() => setIsDiscordOpen(true)}
            onReset={actions.reset}
            hasDiscordConfigured={Boolean(state.discordWebhookUrl)}
            user={cloud.user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isSyncing={cloud.isSyncing}
            panicModeEnabled={Boolean(state.panicModeEnabled)}
            onTogglePanicMode={actions.togglePanic}
            soundEnabled={state.soundEnabled !== false}
            onToggleSound={actions.toggleSound}
            onExportCSV={actions.exportCSV}
            onExportJSON={actions.exportJSON}
            onImportJSON={actions.importJSON}
          />

          <TimelineBar
            currentDay={state.currentDay}
            onDayChange={actions.setDay}
            isOverAllowance={todaySpent > activeDailyAllowance}
          />

          <AlertBanners
            panicModeEnabled={Boolean(state.panicModeEnabled)}
            panicAllowance={financials.panicModeDailyAllowance}
            onDeactivatePanic={actions.togglePanic}
            currentDay={state.currentDay}
            todaySpent={todaySpent}
            dailyAllowance={activeDailyAllowance}
          />

          <MetricCards financials={financials} panicModeEnabled={Boolean(state.panicModeEnabled)} />

          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <main id="main-content" className="flex-1 pb-10">
            <div
              id="budget-tab-panel"
              role="tabpanel"
              aria-labelledby={`tab-${activeTab.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <TabPanel
                tab={activeTab}
                state={state}
                financials={financials}
                dailyAllowance={activeDailyAllowance}
                actions={actions}
                notify={notify}
              />
            </div>
          </main>

          <AppFooter />
        </div>

        {isDiscordOpen && (
          <Suspense fallback={null}>
            <DiscordModal
              isOpen={isDiscordOpen}
              onClose={() => setIsDiscordOpen(false)}
              webhookUrl={state.discordWebhookUrl}
              onSaveWebhookUrl={actions.setDiscordWebhook}
              autoPing={state.discordAutoPing}
              onToggleAutoPing={actions.setDiscordAutoPing}
              financials={financials}
            />
          </Suspense>
        )}

        <ConfirmModal
          isOpen={confirmOptions !== null}
          title={confirmOptions?.title ?? ''}
          message={confirmOptions?.message ?? ''}
          confirmLabel={confirmOptions?.confirmLabel}
          isDestructive={confirmOptions?.isDestructive}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </ErrorBoundary>
  );
}
