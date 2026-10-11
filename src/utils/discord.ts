import { ComputedFinancials } from './financeCalculators';

export interface DiscordSendResult {
  success: boolean;
  message: string;
}

export async function sendDiscordDailyNotification(
  webhookUrl: string,
  financials: ComputedFinancials
): Promise<DiscordSendResult> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      message: 'Please provide a valid Discord Webhook URL in Discord Settings.',
    };
  }

  const cleanUrl = webhookUrl.trim();
  if (!cleanUrl.startsWith('https://discord.com/api/webhooks/') && !cleanUrl.startsWith('https://discordapp.com/api/webhooks/')) {
    return {
      success: false,
      message: 'Invalid Discord webhook format. It must start with https://discord.com/api/webhooks/...',
    };
  }

  const embedColor =
    financials.healthScore >= 75
      ? 0x10B981 // Emerald
      : financials.healthScore >= 50
      ? 0xF59E0B // Amber
      : 0xEF4444; // Red

  const payload = {
    username: 'BareBones Finance Bot',
    avatar_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128&auto=format&fit=crop&q=80',
    content: `🔔 **Daily Financial Check-in** — Day ${financials.currentDay} of 30! Don't forget to log your expenses.`,
    embeds: [
      {
        title: '💀 BareBones — Day ' + financials.currentDay + ' Status',
        description:
          financials.healthScore >= 80
            ? '🔥 You are crushing your budget! Pacing is steady.'
            : financials.healthScore >= 50
            ? '⚠️ Budget is tightening. Stick to your daily allowance!'
            : '🚨 Budget danger! Squeeze discretionary spending immediately.',
        color: embedColor,
        fields: [
          {
            name: '🗓️ Timeline',
            value: `Day **${financials.currentDay}** of 30 (${financials.daysRemaining} days left)`,
            inline: true,
          },
          {
            name: '💰 Remaining Balance',
            value: `**₹${financials.remainingBalance.toLocaleString('en-IN')}**`,
            inline: true,
          },
          {
            name: '📅 Free Daily Allowance',
            value: `**₹${financials.freeDailyAllowance}** / day`,
            inline: true,
          },
          {
            name: '❤️ Financial Health',
            value: `**${financials.healthScore} / 100** (${financials.healthRating})`,
            inline: true,
          },
          {
            name: '🛡️ Financial Risk',
            value: `**${financials.riskScore} / 100** (${financials.riskRating})`,
            inline: true,
          },
          {
            name: '🎯 Savings Goals',
            value: `**${financials.savingsFundedPercent}% funded** (₹${financials.totalMovedToSavings.toLocaleString('en-IN')} saved)`,
            inline: true,
          },
        ],
        footer: {
          text: 'Every penny counts — survive the month on ₹10,000.',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  // Try via proxy first to bypass any browser CORS restrictions
  try {
    const proxyResponse = await fetch('/api/discord-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: cleanUrl,
        payload,
      }),
    });

    if (proxyResponse.ok) {
      return {
        success: true,
        message: 'Discord notification successfully sent!',
      };
    }
  } catch (proxyErr) {
    console.warn('Proxy route unavailable, trying direct fetch...', proxyErr);
  }

  // Fallback direct fetch
  try {
    const directResponse = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (directResponse.ok || directResponse.status === 204) {
      return {
        success: true,
        message: 'Discord notification successfully sent!',
      };
    } else {
      const errText = await directResponse.text();
      return {
        success: false,
        message: `Discord rejected webhook: ${errText || directResponse.statusText}`,
      };
    }
  } catch (directErr: any) {
    return {
      success: false,
      message: `Failed to ping Discord: ${directErr.message || 'Network error'}`,
    };
  }
}
