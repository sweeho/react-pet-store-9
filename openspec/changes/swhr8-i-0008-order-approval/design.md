# Design notes: order-approval (legacy implementation)

## User interface

No screen records were extracted for this capability; its user interface is unspecified. (The administrator approve/deny pages live in the admin module and were not recorded under this capability.)

## How the legacy application implements it

- `PurchaseOrderMDB` (opc) receives the purchase order, stores it, starts the workflow in PENDING and applies the auto-approval limits (US < 500, JP < 50000). Limits also appear in `conf/petstore.properties` lines 23-29; no limit exists for zh_CN.
- `OrderApprovalMDB` (opc) handles approval/denial messages, ignoring orders not PENDING; `OrderApprovalTD` builds the supplier purchase order.
- `ProcessManagerEJB` / `ManagerEJB` (processmanager) hold one CMP status record per order (primary key orderId). `OrderStatusNames` lists five statuses (PENDING, APPROVED, DENIED, SHIPPED_PART, COMPLETED).
- DDL constraint in `petstore_oracle.sql` (~173, ~234) allows only four values (no SHIPPED_PART): a code/schema conflict to resolve.
- `TransitionDelegateFactory` instantiates delegates by class name; reachability was not established.
- `AsyncSenderEJB` publishes one text message to a configured queue inside the caller's transaction (Required); failures are raised to the caller.
- `OrderApproval.dtd` / `Mail.dtd` define the XML documents; `XMLDocumentUtils` validates against them via an overridable catalog.
- The petstore web tier passes total and locale in the order message; the mail-on-order/approval/completion defaults are off in `petstore.properties`.
- Source disagreements: the admin module (ADM-BR-0009) is marked contradicts-docs; `ADMIN-REQ-0002` (sales totals) and `INVENTORY-REPORTING-BUSINESS-RULE-0001` appear to belong to other capabilities.
- Pass disagreement on ORDAPP-RULE-0002: pass A reads the not-PENDING guard in `OrderApprovalMDB`; pass B reads the other-locale hold. The spec states the guard; the locale hold is covered in the automatic approval requirement.
- Records ADM-BR-0009 and OA-REQ-0001 are disputed against the user guide (exactly 500, zh_CN limit); the code says below 500 approves.

## Codebase findings (planning, SWHR8-S-0007)

Read on the sprint branch before planning. The extracted notes above describe the legacy system; this section describes what this repository already has.

- `db/schema.ts` already has `order_status` (`order_id` primary key referencing `purchase_order`, `status` text, no CHECK). `purchase_order` carries `order_id`, `user_id`, `order_date`, `locale`, `total`. No new order table is needed for the status record.
- `server/checkout/repository.ts` is the only module that touches the order tables (ARCHITECTURE.md Key Decisions). `storeReceivedOrder` already inserts `order_status = PENDING` in the receipt transaction and ignores a redelivered order. `getOrderStatus` reads it. There is no update, find-by-status or listing query yet.
- `server/checkout/service.ts` `receiveOrderMessage(xml)` is the order-processing entry point. Order approval extends it and never touches the checkout request.
- `server/checkout/queue.ts` is the in-process transactional outbox (`order_message` table plus a drain on the next tick and on server start). There is no broker and no other queue.
- `server/checkout/xml.ts` has a small hand-written XML parser (`parseXml`, `child`, `text`) and `orderToXml`. The order message already carries `<TotalPrice>` and `<Locale>`. There is no DTD or catalog validation anywhere.
- The session locales are `en_US`, `de_DE`, `ja_JP` and `zh_CN` (the locale selection screen and `src/i18n/`).
- Locked tests: `tests/acceptance/order-approval/approval.test.ts` fixes the module boundary `server/approval/service.ts` (pure, synchronous functions over an injected `store = { records: Map }`, `queue = { deliver }` and `transaction = { enlist }`). `tests/acceptance/order-checkout/placement.test.ts` case SWHR8-C-0160 places a 25.00 en_US order, calls `receiveOrderMessage`, and expects tracking status **PENDING** straight after receipt.
- Fulfilment (SWHR8-I-0010), customer e-mails (SWHR8-I-0009) and admin approve/deny (SWHR8-I-0011) are later capabilities. Nothing consumes a decision yet.

## Planning decisions

- **P1. Pure core, thin adapters.** `server/approval/service.ts` holds every rule as the locked test's synchronous functions over injected store, queue and transaction. Production passes adapters: a status store over `order_status` and queues over a database outbox. The rules have one implementation, and production reuses it.
- **P2. Auto-approval is applied in two steps, as the legacy did** (`PurchaseOrderMDB` then `OrderApprovalMDB`). Receipt stores the order PENDING (unchanged, so SWHR8-C-0160 stays green). In the same transaction, when `evaluateOrder` says APPROVED, it puts an OrderApproval document (`<OrderApproval><Order><OrderId/><OrderStatus>APPROVED</OrderStatus></Order></OrderApproval>`) on the `order-approval` queue. That queue's drain reads each document with `parseApprovalDocument` and applies each entry with `handleDecision`. Administrator decisions (SWHR8-I-0011) enter through the same queue, so one guard covers both paths. The order-checkout spec's "Order processing receipt" requirement already says receipt publishes an approval when auto-approval applies.
- **P3. One generic outbox for the shared send.** A new `queue_message` table (`id`, `queue`, `body`, `status`, `created_at`) with a Drizzle migration. `sendMessage` writes one row per message. Inside a caller's database transaction the row commits or rolls back with the caller's work (R-0089). A failed insert throws to the caller (R-0088). `order_message` stays as it is: the checkout hand-off is not changed.
- **P4. Applied decisions go out on the `order-decision` queue.** `handleDecision`'s `send` is `sendMessage` to `order-decision`, inside the same transaction as the status update. If the update fails, nothing is sent. A non-PENDING order makes no change and sends nothing. Fulfilment and notifications drain `order-decision` in their own sprints. This change only publishes.
- **P5. Status vocabulary is five names.** PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED are accepted, and any other value is refused in code (see SD1). Every status write goes through the repository, which checks the value. No DB CHECK constraint is added: the legacy DDL's four-value CHECK is the conflict itself.
- **P6. Thresholds are an exact-locale table:** `en_US` below 500 and `ja_JP` below 50000. Equality, any other locale (`de_DE`, `zh_CN`) and a non-finite total all stay PENDING.
- **P7. No screens and no HTTP route.** The listing and find-by-status are server functions (`listOrderStatuses`, `findOrdersByStatus`, plus repository queries) that Admin order management will expose.

## Phases

1. **Data model.** Add the `queue_message` table and its generated migration. Add repository functions: status update with vocabulary check and not-found error, find by status, and the listing join (inner join `purchase_order` × `order_status`). (tasks 1.1–1.4)
2. **Rules.** Write `server/approval/service.ts`: vocabulary, status record operations, `createOrderMessage`, `evaluateOrder`, `receiveOrder`, `handleDecision` and `parseApprovalDocument`. (tasks 2.1–2.5, 3.1–3.2)
3. **Messaging and wiring.** Add `sendMessage`, the database outbox queue adapters and the `order-approval` drain, and extend checkout receipt to enqueue the auto-approval in its transaction. (tasks 4.1–4.3, 2.2)
4. **Test harness.** Each case in the locked file `tests/acceptance/order-approval/approval.test.ts` passes. Unit tests under `src/test/server/approval/` cover the adapters and the receipt-to-approved flow against the in-memory db. The existing checkout suites, including SWHR8-C-0160, stay green.
5. **CI.** No workflow change is needed: the existing workflow runs lint, typecheck, unit, acceptance and E2E on `vortex/**` pushes and PRs. The new tests are picked up by path.

## Spec discrepancies

Recorded at planning. The delta spec is left as extracted.

- **SD1. Four versus five statuses.** R-0148 refuses anything outside PENDING, APPROVED, DENIED and COMPLETED. R-0083 and the brief accept SHIPPED_PART. The legacy DDL CHECK allows four values, while `OrderStatusNames` lists five. Resolved as five (P5), because fulfilment must record partly shipped orders. The locked case SWHR8-C-0098 only refuses an invalid name, so it is satisfied either way.
- **SD2. Auto-approval timing versus checkout receipt.** R-0195 and R-0196 say an under-limit order "is APPROVED" when received. Locked case SWHR8-C-0160 (order-checkout) expects PENDING immediately after `receiveOrderMessage` for an under-limit en_US order. Resolved by the legacy two-step flow (P2): PENDING at receipt, APPROVED once the approval queue drains.
- **SD3. Exactly at the limit.** The user guide (ADM-BR-0009, OA-REQ-0001) says an order of exactly 500 is approved. The code and the spec say strictly below. The spec is followed.
- **SD4. zh_CN limit.** The user guide implies a zh_CN limit. The code, the properties file and the spec have none. zh_CN orders stay PENDING, and so do de_DE orders (a locale this repository has that the legacy limits never named).
- **SD5. Locale naming.** The spec says "US" and "Japan". The repository's locales are `en_US` and `ja_JP`, and the rule matches those exact strings.
- **SD6. DTD validation.** The legacy validates against `OrderApproval.dtd` through an overridable catalog. This repository has no DTD machinery. Element name and child order are checked in code.
- **SD7. Queues.** JMS queues become rows in a database outbox (P3). "Queue down" means the insert fails.
- **SD8. Supplier order and customer mail.** R-0087 speaks of a supplier order and a customer notification. Both are built by later capabilities (SWHR8-I-0010, SWHR8-I-0009). This change publishes the applied decision on `order-decision` only.
