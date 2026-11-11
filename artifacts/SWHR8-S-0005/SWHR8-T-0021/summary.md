---
artifact: ticket-summary
ticket: SWHR8-T-0021
sprint: SWHR8-S-0005
---

# Summary — SWHR8-T-0021 Shopping cart

Per-session in-memory cart (`server/cart/{cart,lines,store}.ts`), `/api/cart` routes (list, add, update, remove), `cartCount` in `GET /api/session`, cart drop on sign-off and signed-on idle expiry. Screens: `/cart` (items and empty state, US-dollar money), `/checkout/error` (Order Error), Add to cart on the item page, a Cart nav entry with badge. Strings are in en_US, ja_JP and zh_CN.

## Files

- Server: `server/cart/*`, `routes/api/cart/*`, `routes/api/session.get.ts`, `routes/api/signoff.post.ts`, `server/customer/auth.ts` (idle drop only).
- UI: `src/pages/cart.tsx`, `src/pages/checkout/error.tsx`, `src/components/cart/*`, `src/pages/item/[id].tsx`, `src/pages/_layout.tsx`, `src/constants/primary-areas.ts`, `src/i18n/screens/*`.
- Tests: `src/test/server/cart/`, `routes/api/cart/cart.test.ts`, `src/pages/cart.test.tsx`, `src/pages/checkout/error.test.tsx`, `e2e/cart.spec.ts`.

## AC coverage

AC-1 to AC-15, AC-18, AC-19 are covered by unit, route, UI and e2e tests. AC-16 and AC-17 are met on the cart side only (Order Error page, session cart can be emptied); C-0077 and C-0082 are deferred to SWHR8-I-0007 (design S1).

## Verification

`bun run lint`, `bun run typecheck`, `bun run test` (221 passed), `bun run test:e2e` (22 passed). Acceptance e2e for shopping-cart, customer-account and localization: C-0077 fails (needs `/checkout`, SWHR8-I-0007); C-0031 and C-0018 fail identically on the parent commit (confirmed for C-0031), unrelated to the cart.

## Deviations

Money on `/cart` is US dollars in every locale (design K6, S3). Quantity input label is `Quantity <itemId>` and the button "Update" (S2).

CODE-REVIEW: pending
