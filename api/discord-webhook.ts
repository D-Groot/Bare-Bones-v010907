interface Req {
  method?: string;
  body?: { webhookUrl?: unknown; payload?: unknown };
}
interface Res {
  status: (code: number) => Res;
  json: (body: unknown) => unknown;
}

const ALLOWED_HOSTS = new Set(['discord.com', 'discordapp.com']);

function isDiscordWebhook(raw: unknown): raw is string {
  if (typeof raw !== 'string' || raw.length > 300) return false;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && ALLOWED_HOSTS.has(u.hostname) && u.pathname.startsWith('/api/webhooks/');
  } catch {
    return false;
  }
}

/** Forwards a Discord webhook post (browsers cannot call Discord directly because of CORS). */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { webhookUrl, payload } = req.body ?? {};
  if (!isDiscordWebhook(webhookUrl)) {
    return res.status(400).json({ error: 'Invalid Discord webhook URL format' });
  }
  if (typeof payload !== 'object' || payload === null || JSON.stringify(payload).length > 20_000) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) return res.status(200).json({ success: true, status: response.status });
    return res.status(response.status).json({ error: 'Discord returned an error', status: response.status });
  } catch {
    return res.status(502).json({ error: 'Could not reach Discord' });
  }
}
