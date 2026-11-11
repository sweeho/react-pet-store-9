---
artifact: ticket-plan
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0006
capability_brief: SWHR8-I-0007
ticket: SWHR8-T-0026
change: swhr8-i-0007-order-checkout-and-payment
---

# PLAN — SWHR8-T-0026 Order checkout and payment details

## Objective

Deliver the whole change `swhr8-i-0007-order-checkout-and-payment`:

- A shopper turns the session cart into a numbered order from one checkout form, pre-filled from the profile.
- The order carries the fixed card and is handed to order processing as an XML message through an in-process outbox. On receipt it is stored as PENDING.
- The confirmation shows the order number and bill-to e-mail.

Read `design.md` first: Codebase findings, then O1–O10, then Spec discrepancies S1–S10. The locked acceptance tests in `tests/acceptance/order-checkout/` fix every module and HTTP boundary.

## Steps

Work through `tasks.md` in order. Each step cites the design section it rests on.

1. **Data model** (tasks 1.1–1.4).
   - Add the seven order tables to `db/schema.ts` (O2) and generate the migration.
   - `server/checkout/model.ts` (cards, `cardExpiry`, line items) and `server/checkout/identifiers.ts` (O3).
   - `server/checkout/repository.ts`, including `nextIdentifier`, `getCounter` and `nextOrderNumber`. The first number is 1001 (O3, S1).
2. **Checkout behaviour** (tasks 2.1–2.5, 4.1–4.3). Build `priceCart` (O4), the contact validation (O5), the fixed card (O6) and `server/checkout/service.ts` `placeOrder`. Check the empty cart first, then the contacts, then draw the number.
3. **Interchange and lifecycle** (tasks 3.1–3.2).
   - `server/checkout/xml.ts` (`lineItemToXml`, `parseAddressXml`, and the purchase-order document).
   - `receiveOrderMessage` / `getOrderTrackingStatus` (O7).
   - `server/checkout/queue.ts`, the outbox with its drain (O8).
   - Nothing for address purge (S6).
4. **HTTP** (O9).
   - `routes/api/checkout/index.post.ts`, `routes/api/checkout/queue.get.ts` and `routes/api/account/profile.get.ts`.
   - Empty the session cart only after a successful hand-off.
   - No route is protected (S2).
5. **Screens** (O10).
   - `src/pages/checkout/index.tsx` (form, missing-fields summary, payment panel, USD order summary) and `src/pages/checkout/confirmation.tsx`.
   - `src/pages/order/index.tsx`, the protected gate that replaces itself with `/checkout`.
   - The cart's Checkout button points to `/order`.
   - Strings go in all three dictionaries.
   - The money rule in DESIGN.md already covers the checkout summary.
6. **Tests.** Cover each scenario at the cheapest tier.
   - Unit tests in `src/test/server/checkout/`.
   - Route tests beside the routes.
   - Page tests beside the pages.
   - `e2e/checkout.spec.ts` for cart → checkout → confirmation and for the missing-fields summary.

   Every linked case must pass unchanged: C-0154 to C-0187, plus the cart cases C-0077 and C-0082. Existing cart, customer-account and site-shell tests stay green. In particular, `src/pages/cart.test.tsx` must be updated if it asserts the `/checkout` href.

7. **CI.** No workflow change (design Phase 6).

## Design reference

Read `artifacts/SWHR8-S-0006/design/MANIFEST.md` for the mockup list. Render each route next to its mockup.

| Mockup       | File                                                                                 | Route / state                            | Viewport |
| ------------ | ------------------------------------------------------------------------------------ | ---------------------------------------- | -------- |
| SWHR8-MCK-43 | `artifacts/SWHR8-S-0006/design/mockup-checkout-form.html`                            | `/checkout`, pre-filled, cart with items | 1440     |
| SWHR8-MCK-44 | `artifacts/SWHR8-S-0006/design/mockup-checkout-form-mobile.html`                     | `/checkout`, pre-filled, cart with items | 390      |
| SWHR8-MCK-45 | `artifacts/SWHR8-S-0006/design/mockup-checkout-form-missing-required-fields.html`    | `/checkout`, after a rejected submit     | 1440     |
| SWHR8-MCK-46 | `artifacts/SWHR8-S-0006/design/mockup-checkout-form-missing-required-fields-mo.html` | `/checkout`, after a rejected submit     | 390      |
| SWHR8-MCK-47 | `artifacts/SWHR8-S-0006/design/mockup-order-confirmation.html`                       | `/checkout/confirmation`, order placed   | 1440     |
| SWHR8-MCK-48 | `artifacts/SWHR8-S-0006/design/mockup-order-confirmation-mobile.html`                | `/checkout/confirmation`, order placed   | 390      |
| SWHR8-MCK-49 | `artifacts/SWHR8-S-0006/design/mockup-order-error-empty-cart.html`                   | `/checkout/error`                        | 1440     |
| SWHR8-MCK-50 | `artifacts/SWHR8-S-0006/design/mockup-order-error-empty-cart-mobile.html`            | `/checkout/error`                        | 390      |

Notes on the mockups:

- They show Search and Administration nav entries that do not exist yet. Show only the areas that exist, and add no checkout nav entry (S4).
- The Order Error page already exists. Change it only where it differs from MCK-49/50.

## File/module ownership

Create:

- `server/checkout/{model,xml,identifiers,repository,service,queue}.ts`
- `drizzle/0003_*.sql` and `drizzle/meta/*`, generated
- `routes/api/checkout/index.post.ts`, `routes/api/checkout/queue.get.ts`, `routes/api/account/profile.get.ts`, and their `*.test.ts`
- `src/pages/checkout/index.tsx`, `src/pages/checkout/confirmation.tsx`, `src/pages/order/index.tsx`, and their tests
- `src/components/checkout/*`
- `src/test/server/checkout/*`
- `e2e/checkout.spec.ts`

Modify:

- `db/schema.ts`: the order tables only.
- `src/pages/cart.tsx` and its test: the Checkout link only.
- `src/pages/checkout/error.tsx` and its test: only if it differs from the mockup.
- `src/i18n/screens/{en_US,ja_JP,zh_CN}.ts`.

Do not edit:

- `tests/acceptance/**` (locked)
- `openspec/**`
- the root docs
- `server/customer/**`: read only, through `getCustomer` / `formFromCustomer`
- `server/cart/**`: use `cartFor`, `listLines`, `empty`

## Definition of Done

- AC-1 to AC-34 of SWHR8-T-0026 are met, one per scenario of `specs/order-checkout/spec.md`.
- The deferred cart cases C-0077 (double submit shows Order Error) and C-0082 (empty cart rejected, nothing queued) pass.
- Fixed interface contracts, which later capabilities code against:
  - the `server/checkout/*` exports named in design Codebase findings;
  - `POST /api/checkout`, `GET /api/checkout/queue` and `GET /api/account/profile` (O9);
  - the `order_status` and `order_message` tables (O2, O8);
  - `receiveOrderMessage(xml)`, which order approval extends (S7).
