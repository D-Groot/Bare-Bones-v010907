import React, { useState } from 'react';
import { X, Bell, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { ComputedFinancials } from '../utils/financeCalculators';
import { sendDiscordDailyNotification } from '../utils/discord';

interface DiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
  autoPing: boolean;
  onToggleAutoPing: (enabled: boolean) => void;
  financials: ComputedFinancials;
}

export const DiscordModal: React.FC<DiscordModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl,
  autoPing,
  onToggleAutoPing,
  financials,
}) => {
  const [urlInput, setUrlInput] = useState(webhookUrl);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSaveAndPing = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = urlInput.trim();
    onSaveWebhookUrl(clean);

    if (!clean) {
      setStatusMessage({
        text: 'Please paste your Discord Webhook URL first.',
        type: 'error',
      });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    const res = await sendDiscordDailyNotification(clean, financials);
    setIsSending(false);

    if (res.success) {
      setStatusMessage({ text: '✅ ' + res.message, type: 'success' });
    } else {
      setStatusMessage({ text: '⚠️ ' + res.message, type: 'error' });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discord-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Discord modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Bell className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="discord-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Discord Notification Setup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive daily reminders to log expenses and check your ₹10,000 budget health.
            </p>
          </div>
        </div>

        {/* Webhook Input Form */}
        <form onSubmit={handleSaveAndPing} className="space-y-4">
          <div>
            <label htmlFor="discord-url-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Discord Webhook URL</span>
              <a
                href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <span>How to get one</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </label>
            <input
              id="discord-url-input"
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                onSaveWebhookUrl(e.target.value);
              }}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Automated Daily Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Automated Daily Discord Ping</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Dispatches a formatted summary whenever your day changes or daily check-in is due.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggleAutoPing(!autoPing)}
              aria-label="Toggle automated daily Discord ping"
              aria-pressed={autoPing}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                autoPing ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoPing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white shadow-sm transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              {isSending ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Send Test Ping Now</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Discord Preview Box */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Message Preview (Discord Embed)
          </span>
          <div className="bg-[#2B2D31] rounded-lg p-3 border-l-4 border-emerald-500 text-xs text-slate-200 space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>BareBones — Day {financials.currentDay} Status</span>
              <span className="text-[10px] text-slate-400 font-normal">Bot</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {financials.healthScore >= 80
                ? '🔥 You are crushing your budget! Pacing is steady.'
                : '⚠️ Budget is tightening. Stick to your daily allowance!'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block">🗓️ Timeline:</span>
                <span className="font-semibold text-white">Day {financials.currentDay} of 30</span>
              </div>
              <div>
                <span className="text-slate-400 block">💰 Remaining:</span>
                <span className="font-semibold text-emerald-400 font-mono tabular-nums">
                  ₹{financials.remainingBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">📅 Daily Allowance:</span>
                <span className="font-semibold text-white font-mono tabular-nums">₹{financials.freeDailyAllowance}/day</span>
              </div>
              <div>
                <span className="text-slate-400 block">❤️ Health Score:</span>
                <span className="font-semibold text-emerald-400">{financials.healthScore}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
