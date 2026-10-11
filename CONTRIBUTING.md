# Contributing

## Setup
```bash
npm install
npm run dev        # http://localhost:3000
```

## Before opening a PR
```bash
npm run typecheck  # tsc --noEmit, strict mode
npm test           # vitest (unit + axe-core accessibility)
npm run build
```
CI runs the same three commands.

## Where things go
- **Business rules / state transitions** → `src/state/budgetReducer.ts` (pure, add a test in `src/test/`).
- **Impure glue** (ids, sounds, toasts, confirm dialogs, file IO) → `src/hooks/useBudgetActions.ts`.
- **Money maths** → `src/utils/financeCalculators.ts`.
- **Untrusted data** (localStorage, Firestore, imported JSON) must pass through `normalizeState`.
- **UI** → `src/components/`. Tabs are lazy-loaded from `TabPanel.tsx`.

## Conventions
- No `alert()` / `confirm()`: use `notify` (toasts) and `confirm` from the hooks.
- Never commit secrets, including Discord webhook URLs.
- Keep interactive elements keyboard-reachable and labelled; the axe tests must stay green.
