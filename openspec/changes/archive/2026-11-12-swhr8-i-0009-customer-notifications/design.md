# Design notes: order-notifications (legacy implementation)

## User interface

No screen records were extracted for this capability; its user interface is unspecified.

## Legacy implementation notes

- The mailer component's message-driven bean (`MailerMDB`) parses a text message into a `Mail` (DTD: Address, Subject, Content) and hands it to `MailHelper`, which sends HTML via a JavaMail session looked up from JNDI (`mail/MailSession`) with X-Mailer "JavaMailer". Send failures are swallowed (a missing mail server is expected); parse/JMS errors are rethrown as EJBException.
- `AsyncSenderEJB` puts a text message on a configured queue; transaction attribute Required, no role restriction. Failures are raised to the caller.
- The OPC customer-relations beans (`MailOrderApprovalMDB`, `MailInvoiceMDB`, `MailCompletedOrderMDB`) each check a boolean env-entry (SendApprovalMail, SendConfirmationMail, SendCompletedOrderMail), default false in `conf/petstore.properties`, build the subject and render the body through a locale-specific XSL template.
- The storefront `OrderEJBAction` stores the bill-to e-mail on the order.
- Several records (INT-0001, INTEGRATION-0005, WORKFLOW-0007, REQ-0007) restate the same Mail DTD structure across passes; ORDNOT-REQ-0007 carries an unresolved-reachability dispute (DTD only, no consuming Java in that module).
- Queue destination name is bound at deploy time and not visible in source.

## Codebase findings (planning, SWHR8-S-0008)

Read on the sprint branch before planning. The extracted notes above describe the legacy system; this section describes what this repository already has.

- **Bill-to e-mail already exists.** `purchase_order.email` is stamped from `billing.email` by `placeOrder` and stored at receipt (`server/checkout/service.ts`, `repository.ts`). `POST /api/checkout` returns `{ orderNumber, email }` and `/checkout/confirmation` shows the e-mail (`src/pages/checkout/confirmation.tsx`, tested in `confirmation.test.tsx`). There is no `POST /api/orders`, `GET /api/orders/:id` or `/orders/:id` page.
- **The outbox exists.** `queue_message` (`db/schema.ts`) plus `databaseQueue(name, tx)` and the synchronous drain pattern live in `server/approval/queue.ts`. `sendMessage` (`server/approval/service.ts`) is the shared asynchronous send, and it already satisfies "queueing failure reported to caller" and "transactional sender" (order-approval R-0088 and R-0089).
- **Decisions are published on one queue.** The approval drain publishes each applied decision as an OrderApproval document (`approvalDocument(orderId, status)`) on `order-decision`. Rows carry one `status`, so only one consumer can drain a queue.
- **Locale selection for mail exists.** `produceOrderMail` (`server/localization/mail.ts`) maps the order locale to `mail_en_US.xsl`, `mail_ja_JP.xsl` or `mail_zh_CN.xsl`, throws for a locale with no stylesheet (de_DE), and has no fallback. There is no XSL engine.
- **The XML parser does not fit mail.** `parseXml` (`server/checkout/xml.ts`) strips `<?…?>` but not `<!DOCTYPE …>`, and it would parse HTML inside `<Content>` as child elements. The locked mail fixtures carry both.
- **There is no mail library and no configuration convention.** `package.json` has no mail dependency. The only `process.env` read is `VITEST` in `db/client.ts`.
- **Locked tests:**
  - `tests/acceptance/order-notifications/mailer.test.ts` fixes `server/notifications/mailer.ts` (`validateMail`, `processMailRequest`, `sendMail`, injected `transport`, `log`, `sender`).
  - `order-mail.test.ts` fixes `server/notifications/order-mail.ts` (`defaultNotificationSettings`, `notifyOrderEvent` with events `received | approved | completed`).
  - `bill-to-email.spec.ts` (C-0108) assumes `POST /api/orders`, `GET /api/orders/:id` and `/orders/:id` (see SD1).
- **Later work:** shipment and completion events come from fulfilment (SWHR8-I-0010), and the switches' admin screen, if any, from admin order management (SWHR8-I-0011).

## Planning decisions

- **N1. Pure core, as in order approval.** `mailer.ts` and `order-mail.ts` export exactly the locked boundaries, with transport, settings, sender and log injected. Production wiring lives in `server/notifications/queue.ts`.
- **N2. Mail request parsing is local to the mailer.** Strip the XML declaration and any `<!DOCTYPE …>`. Require root `Mail` with exactly `Address`, `Subject` and `Content`, in that order. Take `Content` as its raw inner markup (HTML body). Anything else is invalid: `validateMail` returns `{ valid: false }`, and `processMailRequest` rejects without sending (R-0126, R-0218).
- **N3. Delivery failure is swallowed once.** `processMailRequest` calls `transport.send` once per request. A rejection is passed to `log.error`, and the call resolves (R-0155). `sendMail` splits `Address` on commas, trims, drops blanks, and sends `text/html` from `sender` (R-0128). One send call per recipient or one call with all recipients both satisfy C-0111; use one call per recipient.
- **N4. Switches are deployment configuration, off by default**, as in the legacy (env-entries). `notificationSettings()` reads `SEND_APPROVAL_MAIL`, `SEND_CONFIRMATION_MAIL` and `SEND_COMPLETED_ORDER_MAIL`. Only the exact string `true` enables a switch; unset means off. `defaultNotificationSettings()` returns all false. There is no admin UI in this change.
- **N5. Events and subjects.** `approved` and `denied` are gated by `sendApprovalMail` and use subject "Java Pet Store Order Status: <id>". `shipped` is gated by `sendConfirmationMail` ("Java Pet Store Order Shipped: <id>"). `completed` is gated by `sendCompletedOrderMail` ("Java Pet Store Order COMPLETED: <id>"). `received` is accepted and gated by `sendConfirmationMail` (locked test), but the spec defines no received-order mail, so it sends nothing (SD2). The recipient is `order.email`. An order with an empty e-mail sends nothing.
- **N6. Templates are per-locale TypeScript renderers, keyed by the stylesheet name from `produceOrderMail`.** The sent message carries `template` set to that name (for example `mail_en_US.xsl`). A locale with no stylesheet (de_DE) makes no mail and logs the reason. HTML bodies are written in en_US, ja_JP and zh_CN, and every interpolated value is escaped.
- **N7. One queue per consumer; fan-out at publish.** A queue row has one status, so two capabilities cannot drain one queue. The approval drain's `send` additionally publishes the same decision on `order-status-mail`, in the same transaction as the `order-decision` row. `order-decision` becomes fulfilment's queue alone. Fulfilment (SWHR8-I-0010) will publish `shipped` and `completed` on `order-status-mail` the same way. Message body: `<OrderEvent><OrderId/><Event/></OrderEvent>`. Approval decisions may keep the OrderApproval document, and the drain accepts both.
- **N8. Two drains, as in the legacy** (customer-relations MDB, then mailer MDB):
  - The `order-status-mail` drain loads the order through `getPurchaseOrder` and calls `notifyOrderEvent` with a queueing transport. That transport writes a Mail document (Address = recipients joined by commas, Subject, Content) on the `mail` queue.
  - The `mail` drain calls `processMailRequest` with the SMTP transport.
  - A processing error leaves the row queued: it is not handled. A delivery failure marks it delivered, without retry.
- **N9. SMTP via `nodemailer`** (new dependency). Configured by `MAIL_SMTP_URL` and `MAIL_SENDER`. When `MAIL_SMTP_URL` is unset, the transport rejects with "no mail server configured", so the failure is logged and the mail dropped, which matches the legacy default.
- **N10. No new order routes or pages.** R-0125's behaviour already exists. It is covered by unit tests of storage and the confirmation, and the C-0108 locked test is disputed (SD1).

## Phases

1. **Mail request intake (tasks 1.x).** `mailer.ts` parsing and validation, the `mail` queue drain, and reuse of `sendMessage` for hand-over.
2. **Sending and failures (tasks 2.x).** `sendMail`, `processMailRequest`, the SMTP transport, and the swallow-and-log behaviour.
3. **Triggers and settings (tasks 3.x).** Settings from configuration, `notifyOrderEvent` gating, the fan-out from the approval drain, and the `order-status-mail` drain.
4. **Content and addressing (tasks 4.x).** Subjects, recipient and per-locale templates. The bill-to e-mail is verified, not rebuilt.
5. **Test harness.** The locked `mailer.test.ts` and `order-mail.test.ts` pass. Unit tests under `src/test/server/notifications/` cover parsing edge cases, the drains against the in-memory db (decision → mail row → transport, and the default config producing no mail row), and the fan-out leaving `order-decision` unchanged. The order-approval and checkout suites stay green.
6. **CI.** No workflow change is needed: the existing workflow runs lint, typecheck, unit, acceptance and E2E on `vortex/**`.

## Spec discrepancies

Recorded at planning. The delta spec is left as extracted.

- **SD1. The C-0108 locked test assumes a contract the app does not have.** It assumes `POST /api/orders` accepting items and a partial bill-to, `GET /api/orders/:id`, and `/orders/:id`. Placing an order without address fields would violate order-checkout "Required contact data at checkout". The behaviour itself (e-mail stored, shown on `/checkout/confirmation`) is already built. The FEATURE disputes the test (target: test) instead of adding routes.
- **SD2. Event vocabulary.** The locked test's events are `received`, `approved` and `completed`, with `received` mapped to the confirmation switch. The brief and R-0157 tie the confirmation switch to the shipped mail and define no received-order mail. Resolved: `received` is gated but sends nothing, and `shipped` sends the "Order Shipped" mail. Only default-off behaviour is asserted for `received`, so the locked test passes either way.
- **SD3. DTD validation.** The legacy validates against `Mail.dtd`. This repo has no DTD machinery, so structure is checked in code (N2).
- **SD4. Denied orders.** R-0157 sends the status mail for approved or denied orders. The brief agrees. The locked test only covers approved. Both are built.
- **SD5. Queue hand-over and transaction rules (tasks 1.5, 2.4, 2.5) are already delivered** by the order-approval `sendMessage` (R-0088 to R-0090). They are reused, not rebuilt. Their tasks are tagged to the nearest requirement here (R-0156), because this change states no separate requirement for them.
- **SD6. Configuration of the switches.** "Administrator switch" is a deployment setting here (N4), as in the legacy. A UI toggle, if wanted, belongs to admin order management.
