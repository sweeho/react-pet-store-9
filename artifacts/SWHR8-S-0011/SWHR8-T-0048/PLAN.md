# PLAN — SWHR8-T-0048 Order batch jobs

Change: `swhr8-i-0012-order-batch-jobs`. Read its `design.md` FIRST, especially §Codebase findings, B1–B7 and §Spec discrepancies. Then read the delta spec `specs/order-reporting-batch/spec.md` and the locked tests in `tests/acceptance/order-reporting-batch/`.

## Objective

Deliver the four unattended order jobs: the daily extract, the aging report, the weekly purge, and the nightly chain that runs them. Also deliver the inclusive date-range retrieval. Each job is a pure module behind the locked test boundary, plus a CLI that reads the database, sends mail and exits with 0 / 4 / 8.

## Steps (work tasks.md groups in order)

1. **Settings and retrieval** (tasks 4.2, 5.1, 5.2). Add `server/jobs/batch-settings.ts` (design B2) and `server/lib/orders.ts` with `findOrdersBetween` (begin and end inclusive).
2. **Order extract** (tasks 1.1, 1.2). Add `server/jobs/order-extract.ts`, following design B7 and B3. A failure resolves with code 8 and calls `notify({ to: <finance mailbox> })`; it does not throw.
3. **Aging report** (tasks 2.1–2.4). Add `server/jobs/order-aging-report.ts`. It lists PENDING/APPROVED orders older than the stuck threshold (strictly more than 24 hours), oldest first, then MISMATCH lines, then the counts per status. Code 4 plus a mail to ops when anything is listed, else 0.
4. **Purge** (tasks 3.1, 3.2). Add `server/jobs/order-purge.ts` with `selectPurgeable` and `runOrderPurge`, run against the in-memory store shape that the locked test fixes.
   - The cutoff is local midnight `retentionDays` ago; only COMPLETED and DENIED orders are eligible.
   - The DB adapter (design B6) does the deletes in one `db.transaction`, through new delete and read functions in `server/checkout/repository.ts` and `server/fulfillment/repository.ts` that take the transaction handle. Jobs never query the tables directly (ARCHITECTURE.md Key Decisions).
5. **Chain** (tasks 1.3, 3.3, 4.1). Add `server/jobs/schedule.ts` with `runNightlyChain({ date, jobs, waitUntil? })` (design B4) and the placeholders for backup and the inventory report (B5).
6. **CLIs.** Add `scripts/order-extract.ts`, `scripts/order-aging-report.ts`, `scripts/order-purge.ts` and `scripts/nightly-chain.ts`, mirroring `scripts/catalog-check.ts`. Add package scripts for them and a nightly PM2 entry in `ecosystem.config.js` (B4).
7. **Tests.** Add unit tests beside each new pure module, and integration tests for the DB adapters and the repository additions. Adapter tests run in vitest's `server` project (see AGENTS.md §Test & validate). The locked acceptance suite passes unchanged.

## File/module ownership

New: `server/jobs/batch-settings.ts`, `server/jobs/order-extract.ts`, `server/jobs/order-aging-report.ts`, `server/jobs/order-purge.ts`, `server/jobs/schedule.ts`, `server/jobs/order-batch-store.ts` (DB adapter), `server/lib/orders.ts`, `scripts/order-extract.ts`, `scripts/order-aging-report.ts`, `scripts/order-purge.ts`, `scripts/nightly-chain.ts`, and the colocated `*.test.ts` files.
Modified: `server/checkout/repository.ts`, `server/fulfillment/repository.ts`, `package.json` (scripts only), `ecosystem.config.js`, `vitest.config.ts` (only if the server project include must widen), `.gitignore` (`batch-out/`).
Not owned: `tests/acceptance/**` (locked), `openspec/**` (beyond the platform's task stamp), and root docs.

## Design reference

No approved mockup. The capability has no screen, and the shell's "Order batch jobs" entry is left as it is (brief open question).

## Definition of Done

- AC-1 … AC-18 on the ticket are met; each maps 1:1 to a scenario of the delta spec and to locked cases SWHR8-C-0118 … SWHR8-C-0135.
- The locked suite `tests/acceptance/order-reporting-batch/` passes without edits, and the existing unit, acceptance and E2E suites stay green.
- No schema change; if one turns out to be needed, the drizzle migration is committed with it.
