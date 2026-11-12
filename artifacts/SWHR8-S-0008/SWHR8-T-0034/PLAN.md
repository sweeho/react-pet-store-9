# PLAN — SWHR8-T-0034 Customer notifications

Change: `swhr8-i-0009-customer-notifications`. Read `design.md` first, especially Codebase findings, decisions N1–N10 and Spec discrepancies SD1–SD6. Then read the delta spec `specs/order-notifications/spec.md` and the locked tests in `tests/acceptance/order-notifications/`.

## Objective

Order-status e-mails (approved or denied, shipped, completed), each behind its own default-off switch, in the order's language, sent as HTML to the order's bill-to e-mail through a queued mail request. A delivery failure is logged and dropped. A malformed request is an error and sends nothing.

## Steps

Work `tasks.md` in group order.

1. **Mail request intake (1.1–1.5; N2, SD5).** In `server/notifications/mailer.ts`, add a local Mail parser (strip the prolog and DOCTYPE; Address, Subject, Content in order; Content kept as raw inner markup) and `validateMail`. Hand-over reuses `sendMessage` and `databaseQueue` from order approval.
2. **Sending and failures (2.1–2.5; N3, N9).** Add `sendMail` and `processMailRequest` to the mailer. `server/notifications/transport.ts` holds the `nodemailer` SMTP transport from `MAIL_SMTP_URL` and `MAIL_SENDER`. When `MAIL_SMTP_URL` is unset, the transport rejects ("no mail server configured").
3. **Triggers and settings (3.1–3.5; N4, N5, N7, N8).** In `server/notifications/order-mail.ts`, add `defaultNotificationSettings`, `notificationSettings` (env) and `notifyOrderEvent`. In `server/approval/queue.ts`, make the drain's `send` also publish the decision on `order-status-mail` in the same transaction. In `server/notifications/queue.ts`, add the `order-status-mail` drain (order lookup via `getPurchaseOrder`, then `notifyOrderEvent` with a transport that queues a Mail document on `mail`) and the `mail` drain (`processMailRequest` with the SMTP transport). Both follow the synchronous drain pattern of `server/approval/queue.ts`. Each runs on the next tick after an enqueue and on server start.
4. **Content and addressing (4.1–4.3; N5, N6, N10).** `server/notifications/templates.ts` holds en_US, ja_JP and zh_CN HTML renderers keyed by the stylesheet name from `produceOrderMail`, with escaped values. 4.3 needs no new code: verify the stored and displayed bill-to e-mail with unit tests.
5. **Tests.** Add tests under `src/test/server/notifications/`, titled with case keys where one applies. Cover:
   - the parser's edge cases;
   - the default config producing no `mail` row after an approval;
   - an enabled approval producing exactly one `mail` row with the status subject;
   - the fan-out leaving `order-decision` content unchanged;
   - a delivery failure marking the row delivered;
   - a malformed request leaving the row queued.
6. **C-0108.** The locked `bill-to-email.spec.ts` codes against `POST /api/orders`, `GET /api/orders/:id` and `/orders/:id`, which this app must not add (SD1). Do not build them. File `a2a_dispute_test_case(target="test", case_key="SWHR8-C-0108", path="tests/acceptance/order-notifications/bill-to-email.spec.ts")` with SD1 as the reason and the amendment it proposes: cart, then `POST /api/checkout` with full contacts, then `/checkout/confirmation`.

## Interface contract (fixed)

- `server/notifications/mailer.ts` and `server/notifications/order-mail.ts` export exactly the signatures in the header comments of `tests/acceptance/order-notifications/mailer.test.ts` and `order-mail.test.ts`.
- Queue names: `order-status-mail` (order events for customer e-mail; fulfilment SWHR8-I-0010 publishes `shipped` and `completed` here) and `mail` (Mail documents). `order-decision` is fulfilment's queue alone.
- The `order-status-mail` body is `<OrderEvent><OrderId>…</OrderId><Event>approved|denied|shipped|completed</Event></OrderEvent>`.
- Configuration: `SEND_APPROVAL_MAIL`, `SEND_CONFIRMATION_MAIL`, `SEND_COMPLETED_ORDER_MAIL` (`true` enables; default off), `MAIL_SMTP_URL`, `MAIL_SENDER`.

## File/module ownership

- `server/notifications/mailer.ts`, `order-mail.ts`, `templates.ts`, `transport.ts`, `queue.ts` (all new)
- `server/approval/queue.ts` (fan-out in the drain's `send` only)
- `package.json`, `bun.lock` (`nodemailer` and its types)
- `src/test/server/notifications/*` (new)

Out of scope: any route or page; order-checkout files; `order_message`; an admin UI for the switches; shipment and completion triggers (published by fulfilment).

## Design reference

The brief has no approved mockups and this capability has no screens, so there is nothing to export.

## Definition of Done

AC-1 … AC-10 on the ticket hold. Each maps 1:1 to a scenario, and each case in `mailer.test.ts` and `order-mail.test.ts` passes. AC-1 is evidenced by the existing storage and confirmation tests plus the C-0108 test dispute. The order-approval and order-checkout locked suites stay green.
