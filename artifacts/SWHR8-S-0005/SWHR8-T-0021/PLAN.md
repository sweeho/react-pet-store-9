---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0005
capability_brief: SWHR8-I-0006
ticket: SWHR8-T-0021
change: swhr8-i-0006-shopping-cart
---

# PLAN — SWHR8-T-0021 Shopping cart

## Objective

Deliver the whole change `swhr8-i-0006-shopping-cart`. Any shopper, signed on or not, gets a per-session cart. They can add items from the item page, open a cart page where they can update several quantities at once or remove lines, and see current catalog prices with a US-dollar total. The nav shows a Cart entry with a count badge, sign-off and the signed-on idle expiry clear the cart, and an Order Error page covers an empty-cart order. Read `design.md` first: Codebase findings, then K1–K9, then Spec discrepancies S1–S8.

## Steps

Work through `tasks.md` in order. Each step cites the design section it rests on.

1. **Cart model** (tasks 1.1–1.5, 3.2). Create `server/cart/cart.ts` to the locked boundary (design K1) and `parseQuantity` (K5). Unit tests go in `src/test/server/cart/`.
2. **Lines and subtotal** (tasks 2.1–2.3). Add `listLines`/`subtotal` in `cart.ts` (K1) and the async catalog bridge in `server/cart/lines.ts` (K3). Missing items are omitted silently (K9).
3. **Session wiring and API** (task 4.3, plus the session wiring):
   - `server/cart/store.ts` (K2).
   - Routes `routes/api/cart/index.get.ts`, `items.post.ts`, `update.post.ts`, `remove.post.ts` (K4), none of them protected.
   - Change `routes/api/session.get.ts` to report `cartCount`.
   - Make `routes/api/signoff.post.ts` and the idle drop in `server/customer/auth.ts` call `dropCart` (K2).
   - Route tests in `routes/api/cart/*.test.ts`.
4. **Screens** (tasks 3.1, 4.1, 4.2). Follow K6 and K7:
   - `src/pages/cart.tsx`;
   - `src/pages/checkout/error.tsx`;
   - Add to cart on `src/pages/item/[id].tsx`;
   - the `PRIMARY_AREAS` "Cart" entry and its badge in `src/pages/_layout.tsx`;
   - a client helper in `src/components/cart/`;
   - strings in all three dictionaries.

   The button is named "Update", not "Update cart" (S2). Money is always in US dollars (K6, S3). Write UI tests beside each page.

5. **Tests** (task 5.1). Cover each scenario at the cheapest tier, and add `e2e/cart.spec.ts` for add → update → remove → empty message. The locked shopping-cart tests must pass, except C-0077 and C-0082, which are deferred to SWHR8-I-0007 and not linked to this ticket. Customer-account C-0047 must pass.
6. **CI**. No workflow change (design Phase 6).

## Design reference

Read `artifacts/SWHR8-S-0005/design/MANIFEST.md` for the mockup list. Render each route next to its mockup.

| Mockup       | File                                                                      | Route / state              | Viewport |
| ------------ | ------------------------------------------------------------------------- | -------------------------- | -------- |
| SWHR8-MCK-9  | `artifacts/SWHR8-S-0005/design/mockup-cart-page-with-items.html`          | `/cart`, two or more lines | 1440     |
| SWHR8-MCK-10 | `artifacts/SWHR8-S-0005/design/mockup-cart-page-with-items-mobile.html`   | `/cart`, two or more lines | 390      |
| SWHR8-MCK-11 | `artifacts/SWHR8-S-0005/design/mockup-cart-page-empty.html`               | `/cart`, empty cart        | 1440     |
| SWHR8-MCK-12 | `artifacts/SWHR8-S-0005/design/mockup-cart-page-empty-mobile.html`        | `/cart`, empty cart        | 390      |
| SWHR8-MCK-13 | `artifacts/SWHR8-S-0005/design/mockup-order-error-empty-cart.html`        | `/checkout/error`          | 1440     |
| SWHR8-MCK-14 | `artifacts/SWHR8-S-0005/design/mockup-order-error-empty-cart-mobile.html` | `/checkout/error`          | 390      |

The mockups show Search and Administration nav entries that do not exist yet. Show only the areas that exist. The item-page Add to cart control has no mockup, so follow the item page's existing layout.

## File/module ownership

Create:

- `server/cart/cart.ts`, `server/cart/lines.ts` and `server/cart/store.ts`.
- `routes/api/cart/*.ts` (routes and their tests).
- `src/pages/cart.tsx` and `src/pages/cart.test.tsx`.
- `src/pages/checkout/error.tsx` and its test.
- `src/components/cart/*`.
- `src/test/server/cart/*`.
- `e2e/cart.spec.ts`.

Modify:

- `routes/api/session.get.ts` and `routes/api/signoff.post.ts`.
- `server/customer/auth.ts`: the idle drop only.
- `src/components/account/api.ts`, only if the session type needs it.
- `src/pages/item/[id].tsx` and its test.
- `src/pages/_layout.tsx` and its test.
- `src/constants/primary-areas.ts`.
- `src/i18n/screens/{en_US,ja_JP,zh_CN}.ts`.

Do not edit:

- `tests/acceptance/**` (locked);
- `openspec/**`;
- the root docs.

## Definition of Done

- AC-1 to AC-19 of SWHR8-T-0021 are met. They correspond 1:1 to the scenarios in `specs/shopping-cart/spec.md`.
- AC-16 (Empty cart rejects order) and AC-17 (Cart cleared after order hand-off) are met on the cart side: the Order Error page exists and the session cart can be emptied. Their end-to-end cases, C-0082 and C-0077, are deferred to SWHR8-I-0007 (design S1).
- Fixed interface contracts: the `server/cart/cart.ts` exports, the four `/api/cart*` routes and the `cartCount` field of `GET /api/session`, as given in design K1, K4 and K5. Order checkout codes against these.
