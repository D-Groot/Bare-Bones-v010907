# Architecture

BareBones is a client-side React 19 + TypeScript app. All budget data is a single `FinancialState` object; everything shown on screen is derived from it.

```
UI components ──intent──▶ useBudgetActions ──action──▶ budgetReducer ──▶ FinancialState
      ▲                    (ids, sounds, toasts,         (pure)               │
      │                     confirm, file IO)                                  │
      └──────── computeFinancials(state) ◀── useBudget ◀──────────────────────┤
                                                 ├─ localStorage (every change)
                                                 └─ useCloudSync ─▶ Firestore (when signed in)
```

## Layers
| Layer | Files | Responsibility |
|---|---|---|
| State | `src/state/budgetReducer.ts` | Pure reducer; every change is a typed `BudgetAction`. |
| Validation | `src/state/normalizeState.ts` | Coerces/sanitises any untrusted input into a valid state (clamps days, drops bad rows, rejects non-Discord webhooks). |
| Derivation | `src/utils/financeCalculators.ts` | `computeFinancials` (balance, allowance, risk, health) and `simulateDecision` (what-if). |
| Hooks | `src/hooks/` | `useBudget` (reducer + persistence), `useBudgetActions` (impure glue), `useCloudSync` (lazy Firebase), `useToasts`, `useConfirm`. |
| UI | `src/components/` | Presentational tabs and widgets; `TabPanel` lazy-loads each tab. |
| Server | `api/discord-webhook.ts` | Serverless proxy that forwards Discord webhook posts (browsers can't call Discord directly due to CORS). |

## Decisions
- **Reducer + action hook split** keeps business rules unit-testable without React.
- **Firebase loads on idle** (≈550 kB) so first paint doesn't wait for it; the app is fully usable offline from localStorage.
- **Cloud sync loop guard**: a Firestore snapshot identical to local state is ignored, so saving doesn't trigger a re-save.
- **The Discord webhook never leaves the device**: it is excluded from Firestore writes and from remote merges.
- **Per-tab code splitting**: the entry chunk contains only the shell; each tab is fetched on first visit.

## Security notes
- Imported/remote JSON is normalised before use; CSV export prefixes formula-like cells with `'`.
- Firestore rules (`firestore.rules`) restrict each user to their own `users/{uid}/budget/state` document.
- `vercel.json` sets nosniff, frame-deny, referrer and permissions headers, and long-lived caching for hashed assets.
