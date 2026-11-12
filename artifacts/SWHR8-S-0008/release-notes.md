---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0008
capability_brief: SWHR8-I-0009
branch: vortex/sprint/swhr8-s-0008-6b84cd7f
upstream: [artifacts/SWHR8-S-0008/qa-test-report.md]
---

# Release notes — SWHR8-S-0008

## Added

- **Order status e-mail.** When the approval switch is on, a customer whose order is approved or denied gets "Java Pet Store Order Status: <order id>". (SWHR8-T-0034)
- **Shipped and completed e-mail.** "Java Pet Store Order Shipped: <order id>" and "Java Pet Store Order COMPLETED: <order id>", behind their own switches. They start sending once order fulfilment ships. (SWHR8-T-0034)
- **Three independent switches, all off by default.** With the default settings no order e-mail is sent, as in the legacy store. (SWHR8-T-0034)
- **E-mail in the order's language** (en_US, ja_JP or zh_CN). Each e-mail is sent as HTML to the order's bill-to e-mail (to every address, if it lists several), from the store's configured sender. (SWHR8-T-0034)
- **Mail problems never hold up an order.** If no mail server is configured or it rejects a message, the failure is logged and that e-mail is dropped, not retried. (SWHR8-T-0034)
- **Broken mail requests are caught.** A request without an address, subject and body, in that order, is reported as an error and nothing is sent. (SWHR8-T-0034)

## Changed

- Nothing visible to shoppers. The bill-to e-mail was already stored on each order and shown on the order confirmation; it is now where order e-mail goes.

## Upgrade notes

- **New configuration**, all optional:
  - `SEND_APPROVAL_MAIL`, `SEND_CONFIRMATION_MAIL` and `SEND_COMPLETED_ORDER_MAIL`: set one to `true` to turn that e-mail on.
  - `MAIL_SMTP_URL`: the SMTP server. Without it, no mail is delivered.
  - `MAIL_SENDER`: the From address.
- **New dependency** `nodemailer`. Run `bun install`.
- No database migration: e-mail uses the existing `queue_message` outbox, with new queues `order-status-mail` and `mail`.
- No new endpoints or screens.

## Not included

- There is no administrator screen for the switches; they are deployment settings. A screen, if wanted, belongs to Admin order management (SWHR8-I-0011).
- No e-mail is sent when an order is received.
- Shipped and completed e-mails need order fulfilment (SWHR8-I-0010) to publish those events.

## Verification

Verified at integration QA: all 10 scenarios pass, and QA found no defects. See `artifacts/SWHR8-S-0008/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0008/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0008/qa-test-report.md` | Satisfied | —         |
