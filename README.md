# BareBones — Survive the Month on ₹10,000

An interactive personal-finance dashboard for Gen Z: manage a ₹10,000 budget over 30 days, simulate decisions *before* making them, and see how each one changes your balance, daily allowance, savings goals, risk and financial health.

## Features
| Area | What it does |
|---|---|
| 30-day timeline | Slide through Day 1–30; bills and allowances follow the day. |
| Live metrics | Balance, free daily allowance, risk and health score, all derived from one state. |
| Spending | Log/edit/delete expenses, one-tap templates (add and delete), unexpected-spend flag, CSV export. |
| Bills & Subs | Fixed commitments and subscriptions with paid/unpaid tracking. |
| Savings | Goals with deposit/withdraw and "still needed" projection. |
| **What-if simulator** | Preview purchases, subscriptions, bills, surprises, savings or skipping days, with a safety verdict, then apply to your real budget. |
| History | Bank each month; compare spend vs. health across months. |
| Panic Squeeze | One click freezes discretionary spending and locks a survival allowance. |
| Discord reminders | Optional daily check-in embed via your own webhook. |
| Backup | Full JSON backup/restore (validated and sanitised), CSV export. |
| Sync | Works offline from localStorage; sign in with Google to sync via Firestore. |

## Quick start
```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 27 tests (unit + axe-core accessibility)
npm run typecheck
npm run build        # outputs dist/
```
Requires Node 20+. No environment variables are needed (see `.env.example`).

## Deploy (Vercel)
Import the repo; `vercel.json` already sets the build, SPA rewrites, cache and security headers. The `api/discord-webhook.ts` function deploys automatically.

## Discord reminders
Click the bell icon and paste your own webhook URL. It is saved **only in your browser** (never uploaded to Firestore, never in this repo). If you ever committed a webhook, delete it in Discord and create a new one.

## Project layout
See [ARCHITECTURE.md](ARCHITECTURE.md). In short: `src/state` (pure reducer + validation), `src/hooks` (glue), `src/utils` (calculators, storage, export), `src/components` (UI).

## Accessibility & quality
Semantic HTML, ARIA tabs, keyboard-operable controls, skip link, `axe-core` tests, strict TypeScript, CI on every push. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Known limitations
- `npm audit` reports advisories in Firebase's transitive `@grpc/grpc-js`; they are not reachable from this client-only usage but will clear when Firebase ships a fix.
- Browser notifications and sound depend on user permission and browser support.

## License
Apache-2.0, see [LICENSE](LICENSE).
