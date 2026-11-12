# PLAN — SWHR8-T-0030 Order approval

Change: `swhr8-i-0008-order-approval`. Read `design.md` first, especially Codebase findings, Planning decisions P1–P7 and Spec discrepancies SD1–SD8. Then read the delta spec `specs/order-approval/spec.md` and the locked test `tests/acceptance/order-approval/approval.test.ts`.

## Objective

Every received order gets a decision. Under-limit en_US and ja_JP orders are approved automatically, and every other order stays PENDING for an administrator. Each order keeps one status record, and decisions apply only to PENDING orders. Applied decisions are published, all-or-nothing, through a shared transactional send.

## Steps

Work `tasks.md` in order. Each step cites its decision.

1. **Data model (tasks 1.1–1.4; design P3, P5).** Add the `queue_message` table to `db/schema.ts` and generate and commit its migration under `drizzle/`. In `server/checkout/repository.ts`, add: a status update that checks the vocabulary and throws a not-found error for an unknown order, find-by-status, and the listing join (`purchase_order` inner join `order_status`). Keep the existing PENDING insert in `storeReceivedOrder`.
2. **Rules (tasks 2.1–2.5, 3.1–3.2; design P1, P6, SD1, SD6).** Create `server/approval/service.ts` with exactly the exports the locked test names (see Interface contract). All of them are pure and synchronous over the injected `store`, `queue` and `transaction`. `NotFoundError` is an `Error` whose `name` is `"NotFoundError"`.
3. **Messaging and wiring (tasks 4.1–4.3, 2.2; design P2, P3, P4).** Create `server/approval/queue.ts`: a status-store adapter over the repository, a `queue_message` queue adapter bound to a queue name and an optional Drizzle transaction, and the `order-approval` drain. The drain parses each document, then applies `handleDecision` with `send` = `sendMessage` to `order-decision`, all in one transaction. A failed row stays queued. The drain runs on the next tick and on server start, mirroring `server/checkout/queue.ts`. Extend checkout receipt: in the same transaction as `storeReceivedOrder`, an order that `evaluateOrder` approves puts an APPROVED OrderApproval document on `order-approval`. A redelivered order that is already stored enqueues nothing.
4. **Tests.** Add unit tests under `src/test/server/approval/`, titled with their case keys, covering the adapters and the receipt-to-drain-to-APPROVED flow against the in-memory db. Include one rollback test: a failing status update leaves no `order-decision` row.

## Interface contract (fixed — the locked test codes against it)

`server/approval/service.ts` exports: `isRecognisedStatus`, `createStatusRecord`, `getStatus`, `updateStatus`, `findOrdersByStatus`, `listOrderStatuses`, `parseApprovalDocument`, `createOrderMessage`, `evaluateOrder`, `receiveOrder`, `handleDecision`, `sendMessage`. Their signatures are those in the header comment of `tests/acceptance/order-approval/approval.test.ts`. Do not change them. Queue names: `order-approval` (decisions to apply) and `order-decision` (applied decisions, for SWHR8-I-0009 and SWHR8-I-0010). `receiveOrderMessage`'s behaviour of storing PENDING at receipt does not change.

## File/module ownership

- `server/approval/service.ts` (new), `server/approval/queue.ts` (new)
- `server/checkout/repository.ts`, `server/checkout/service.ts` (receipt wiring only)
- `db/schema.ts`, `drizzle/*` (new migration and journal)
- `src/test/server/approval/*` (new)

Out of scope: any page or HTTP route (admin screens are SWHR8-I-0011), supplier orders (SWHR8-I-0010), e-mail (SWHR8-I-0009), and `order_message` and the checkout drain.

## Design reference

The brief has no approved mockups and this capability has no screens, so there is nothing to export and nothing to render.

## Definition of Done

AC-1 … AC-23 on the ticket all hold. Each maps 1:1 to a scenario, and each scenario's case in `tests/acceptance/order-approval/approval.test.ts` passes. The order-checkout locked case SWHR8-C-0160 still passes.
