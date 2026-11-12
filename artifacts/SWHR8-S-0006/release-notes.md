---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0006
capability_brief: SWHR8-I-0007
branch: vortex/sprint/swhr8-s-0006-d274d8d7
upstream: [artifacts/SWHR8-S-0006/qa-test-report.md]
---

# Release notes — SWHR8-S-0006

## Added

- **Checkout.** From the cart, a signed-on shopper opens one checkout form for billing and shipping details. A shopper who is not signed on is sent to sign on first and brought back. (SWHR8-T-0026)
- **Pre-filled form.** The form starts with the details from your saved profile. (SWHR8-T-0026)
- **Required details.** Last name, first name, street address, city, state or province, postal code and telephone are required for both billing and shipping. Address line 2 and e-mail are optional. If a required field is blank, no order is placed and the form lists what is missing. (SWHR8-T-0026)
- **Order confirmation.** Placing an order shows its order number and the bill-to e-mail. Order numbers start at 1001. (SWHR8-T-0026)
- **Order total** is the sum of unit price times quantity, to two decimals, in US dollars, matching the cart total. (SWHR8-T-0026)
- **Orders go to order processing**, where they are recorded as PENDING, ready for order approval. (SWHR8-T-0026)
- Checkout text appears in your chosen language (en_US, ja_JP or zh_CN). (SWHR8-T-0026)

## Changed

- The cart's **Checkout** button now leads to checkout instead of a dead end. (SWHR8-T-0026)
- Your cart is **emptied after an order is placed**. (SWHR8-T-0026)
- Submitting an order with an **empty cart** shows the Order Error page and places no order. (SWHR8-T-0026)
- Every order carries the same fixed payment card (1234-2334, Duke Express, 10/2001), whatever card your account holds. No payment is taken. (SWHR8-T-0026)

## Upgrade notes

- **Database migration** `drizzle/0003_*` adds seven order tables (orders, lines, order contacts, order cards, order status, identifier counters, order messages). Apply it before starting the server.
- New endpoints: `POST /api/checkout` (409 if the same session submits twice at once), `GET /api/checkout/queue`, `GET /api/account/profile`.
- Queued order messages are drained on the next tick and again on server start, so an order queued before a restart is still recorded.

## Not included

- Automatic approval, administrator decisions, fulfilment, invoices and order e-mails arrive with their own capabilities. Orders stay PENDING until then.
- No "Order checkout & payment" navigation entry; checkout is reached from the cart, as the approved mockups show.
- The first order number and the fixed card await a Business Owner ruling.

## Verification

Verified at integration QA: 34 of 34 scenarios pass and QA found no defects. See `artifacts/SWHR8-S-0006/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0006/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0006/qa-test-report.md` | Satisfied | —         |
