import React, { useRef } from 'react';
import {
  Bell,
  RotateCcw,
  Moon,
  Sun,
  Cloud,
  LogIn,
  LogOut,
  Volume2,
  VolumeX,
  ShieldAlert,
  Download,
  FileJson,
  Upload,
} from 'lucide-react';
import type { CloudUser } from '../hooks/useCloudSync';
import { Logo } from './Logo';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenDiscord: () => void;
  onReset: () => void;
  hasDiscordConfigured: boolean;
  user: CloudUser | null;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing: boolean;
  panicModeEnabled: boolean;
  onTogglePanicMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenDiscord,
  onReset,
  hasDiscordConfigured,
  user,
  onLogin,
  onLogout,
  isSyncing,
  panicModeEnabled,
  onTogglePanicMode,
  soundEnabled,
  onToggleSound,
  onExportCSV,
  onExportJSON,
  onImportJSON,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  return (
    <header
      role="banner"
      className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-1 sm:px-0"
    >
      <Logo size="md" />

      <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto">
        {/* Panic Squeeze Mode Toggle */}
        <button
          type="button"
          onClick={onTogglePanicMode}
          aria-pressed={panicModeEnabled}
          aria-label={panicModeEnabled ? 'Deactivate Panic Mode' : 'Activate Panic Squeeze Mode'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border focus-visible:ring-2 focus-visible:ring-violet-500 ${
            panicModeEnabled
              ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40 animate-pulse'
              : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
          }`}
          title="Panic Mode: Freezes discretionary spending and locks emergency buffer"
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${panicModeEnabled ? 'text-white' : 'text-rose-500'}`} aria-hidden="true" />
          <span className="hidden sm:inline">
            {panicModeEnabled ? 'Panic Squeeze: ON' : 'Panic Squeeze'}
          </span>
        </button>

        {/* Audio Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
          title={soundEnabled ? 'Mute audio' : 'Enable audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          )}
        </button>

        {/* Data Export CSV */}
        <button
          type="button"
          onClick={onExportCSV}
          aria-label="Export budget to CSV"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
          title="Download expenses as CSV spreadsheet"
        >
          <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        </button>

        {/* Full JSON backup */}
        <button
          type="button"
          onClick={onExportJSON}
          aria-label="Download full JSON backup"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
          title="Download a full JSON backup"
        >
          <FileJson className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        </button>

        {/* Data Import JSON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Import budget backup JSON"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
          title="Restore budget from JSON backup"
        >
          <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
          aria-hidden="true"
        />

        {/* Firebase User Authentication */}
        {user ? (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1 text-xs shadow-sm">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[10px]">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="font-medium text-slate-700 dark:text-slate-200 hidden md:inline max-w-[90px] truncate">
              {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
            </span>
            <span
              className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium"
              title={isSyncing ? 'Syncing to Firestore...' : 'Synced to Firestore cloud'}
            >
              <Cloud
                className={`w-3 h-3 ${isSyncing ? 'animate-bounce text-violet-500' : 'text-emerald-500'}`}
                aria-hidden="true"
              />
            </span>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1 focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            aria-label="Sign in with Google"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-violet-500"
            title="Sign in with Google to sync budget across devices"
          >
            <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign In</span>
          </button>
        )}

        {/* Ping Discord Button */}
        <button
          type="button"
          onClick={onOpenDiscord}
          aria-label="Open Discord settings and dispatch check-in"
          className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
          title="Discord Webhook Settings & Daily Ping"
        >
          <Bell className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          <span className="hidden sm:inline">Ping Discord</span>
          {hasDiscordConfigured && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" aria-hidden="true" />
          )}
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset budget to initial ₹10,000 state"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
          title="Reset to default ₹10,000 budget & state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode for late-night data entry'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4 text-violet-600" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
};
