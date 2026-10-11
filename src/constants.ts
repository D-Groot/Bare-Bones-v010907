import type { Category } from './types/finance';

export const CATEGORIES: readonly Category[] = [
  'Housing',
  'Food & Drink',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Education',
  'Other',
] as const;

export const MONTH_DAYS = 30;
export const DISCORD_WEBHOOK_PREFIXES = [
  'https://discord.com/api/webhooks/',
  'https://discordapp.com/api/webhooks/',
] as const;

export function isDiscordWebhookUrl(url: string): boolean {
  return DISCORD_WEBHOOK_PREFIXES.some((p) => url.startsWith(p));
}
