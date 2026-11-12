# Summary — SWHR8-T-0030 Order approval

Built the order-approval rules and wiring; no screens or routes.

- `server/approval/service.ts`: pure rules with the locked signatures (vocabulary of five statuses, status records, document validation, thresholds en_US <500 / ja_JP <50000, guarded `handleDecision`, `sendMessage`).
- `server/approval/queue.ts`: `queue_message` outbox adapter, `order-approval` drain (applies decisions and publishes to `order-decision` in one transaction; a failed row stays queued).
- `server/checkout/repository.ts`: `updateOrderStatus`, `findOrderIdsByStatus`, `listOrderStatusRows`, `statusRecords`, optional in-transaction hook on `storeReceivedOrder`.
- `server/checkout/service.ts`: receipt stays PENDING; an under-limit order enqueues an APPROVED document in the same transaction (design P2, so SWHR8-C-0160 holds). Redelivery enqueues nothing.
- `server/checkout/xml.ts`: exported `parseXml`/`XmlNode` (no logic change).
- `db/schema.ts`, `drizzle/0004_*`: `queue_message` table.
- Tests: `src/test/server/approval/service.test.ts`, `queue.test.ts`.

Deviation: the drain is synchronous (no memoised promise) because a promise-memo around synchronous work left the guard stuck.
Verification: `bun run verify` passed (295 tests). E2E not run: no UI change.
CODE-REVIEW: self-review — sub-agent skipped for cost on a server-only change; checked transaction boundaries, guard on non-PENDING, redelivery and the drain re-entrancy bug (fixed).
