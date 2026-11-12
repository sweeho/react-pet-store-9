---
artifact: ticket-summary
sprint: SWHR8-S-0006
ticket: SWHR8-T-0026
---

# Summary: Order checkout and payment details

Built the whole change `swhr8-i-0007-order-checkout-and-payment`: a shopper turns the session cart into an order (first number 1001) from one pre-filled form; the order carries the fixed card, goes as XML through an in-process outbox, and is stored as PENDING on receipt. The confirmation shows the order number and bill-to e-mail.

## What changed

- `db/schema.ts` and `drizzle/0003_*`: seven order tables (design O2).
- `server/checkout/{model,xml,identifiers,repository,service,queue}.ts`: pricing in integer cents, validation (empty cart, then contacts, then number), fixed card, XML writer/parser, counters, outbox with re-drain.
- `routes/api/checkout/{index.post,queue.get}.ts`, `routes/api/account/profile.get.ts`.
- `src/pages/checkout/{index,confirmation}.tsx`, `src/pages/order/index.tsx`, `src/components/checkout/*`, three dictionaries; cart Checkout button now links to `/order`.
- Tests: server, route, page and `e2e/checkout.spec.ts`.

## AC coverage

All scenarios, via cases C-0077, C-0082, C-0154 to C-0187. The locked acceptance tests pass at the platform green run.

## Decisions and deviations

- Order-number start 1001 per C-0170 (S1, still disputed); `/checkout` and the API stay open to signed-out sessions (S2); country is derived from locale (S5).
- A per-session in-flight guard on `POST /api/checkout` answers a concurrent second submit with 409.
- A failed hand-off after the number was drawn leaves a gap in the sequence; accepted.
- Pre-existing race in `[SWHR8-C-0022]` (`e2e/localization.spec.ts`) surfaced under the added e2e load; fixed with a one-line wait for the options.

## Verification

`bun run lint`, `bun run typecheck`, `bun run test`: green. `bun run test:e2e`: checkout specs pass. Design check: `design-check.md`.

CODE-REVIEW: sub-agent — fixed outbox missed-row race, unhandled drain rejection, concurrent double submit, profile overwriting typed input; rejected: order-number gap on failed hand-off (O9 only requires the cart be kept).
