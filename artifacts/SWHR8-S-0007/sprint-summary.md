---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0007
capability_brief: SWHR8-I-0008
branch: vortex/sprint/swhr8-s-0007-7c22f342
upstream: [artifacts/SWHR8-S-0007/SPRINT-PLAN.md, artifacts/SWHR8-S-0007/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0007/release-notes.md]
---

# Sprint summary — SWHR8-S-0007

Sprint goal met. Every received order now gets a decision. US orders under 500 and Japan orders under 50000 are approved automatically, and every other order stays PENDING for an administrator. Each order has one status record, decisions apply only to PENDING orders, and each applied decision is published in the same transaction as the status change. QA passed all 23 scenario verdicts with no defects.

## Tickets

| Ticket       | Type    | Title                                | Outcome                                                            |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------ |
| SWHR8-T-0029 | TASK    | Sprint plan — SWHR8-S-0007           | DONE (commit 33d1e3a)                                              |
| SWHR8-T-0030 | FEATURE | Order approval                       | DONE (PR #34, commit cf346c3); detail in `SWHR8-T-0030/summary.md` |
| SWHR8-T-0031 | TASK    | Integration QA report — SWHR8-S-0007 | DONE (PR #36, commit eaf39bd)                                      |
| SWHR8-T-0032 | TASK    | Sprint close bundle — SWHR8-S-0007   | this ticket                                                        |

## What shipped

Against SWHR8-I-0008 (change `swhr8-i-0008-order-approval`). SWHR8-T-0030 delivered all 14 tasks:

- **Rules.** `server/approval/service.ts` holds the pure, synchronous rules with the locked-test signatures:
  - the status vocabulary of five names;
  - status records: create, read, update and find by status;
  - the order status listing;
  - approval document validation;
  - the thresholds `en_US` < 500 and `ja_JP` < 50000;
  - the PENDING-only `handleDecision`;
  - `sendMessage` (design.md P1, P5, P6).
- **Two-step auto-approval.** Receipt still stores the order as PENDING. In the same transaction, an order under its limit puts an APPROVED OrderApproval document on the `order-approval` queue. That queue's drain applies the decision. This keeps locked checkout case SWHR8-C-0160 green (P2, SD2).
- **Shared outbox.** A new `queue_message` table (`drizzle/0004_*`) backs every queue. The drain updates `order_status` and publishes the applied decision on `order-decision` in one transaction, and a failed row stays queued (P3, P4). `server/approval/queue.ts` holds the adapters.
- **Repository.** `server/checkout/repository.ts` gained status update (vocabulary check, not-found error), find by status, the listing join, and a hook that runs inside the receipt transaction.
- **No screens or routes.** The listing and find-by-status are server functions for Admin order management (SWHR8-I-0011).

## Divergence from plan

- **Drain:** the `order-approval` drain is synchronous instead of mirroring the checkout drain's memoised promise. Wrapping synchronous work in a promise memo left the re-entrancy guard stuck. The fix was found and made in the FEATURE.
- **Small additions:** `server/checkout/xml.ts` now exports `parseXml` and `XmlNode` so the approval document parser can reuse them. It has no logic change and was not in the ownership map.
- Everything else was built as planned. Spec discrepancies SD1 to SD8 were resolved as `design.md` recorded them.

## Verification

PASS. See `qa-test-report.md`. All 23 scenario verdicts pass. `bun run verify` is clean with 295 of 295 unit tests passing. E2E passes 24 of 24 (no spec targets this capability, which has no UI). The order-approval locked acceptance file passes in full. There are no defects (`integration-defects-resolution.md`). Coverage was not measured because `@vitest/coverage-v8` is not installed.

## Known findings carried forward

These are not defects in this sprint's code, but they should not be lost:

- **No consumer for `order-decision` yet.** Applied decisions are published, but nothing drains them until fulfilment (SWHR8-I-0010) and customer e-mails (SWHR8-I-0009) ship. Rows accumulate in `queue_message` until then.
- **Admin decisions have no entry point yet.** Administrators can only approve or deny once SWHR8-I-0011 enqueues on `order-approval`.
- **Locked acceptance failures in other capabilities** (warnings, triaged at UAT): 98 vitest failures in 21 files, all for capabilities not yet built. Their list is in `qa-test-report.md`. The C-0022, C-0034 and C-0108 failures in built capabilities, raised last sprint, are still unclassified.
- **Spec discrepancies resolved by planning, awaiting confirmation:** five statuses instead of four (SD1), and an order of exactly 500 or 50000 stays PENDING even though the user guide says otherwise (SD3). Both are recorded in the change's `design.md`.
- **SWHR8-T-0024** (drop the carts of expired anonymous sessions) is still in BACKLOG.

## Defects Raised

None. No DEFECT ticket was created during the sprint window, which started 2026-11-12T05:01Z.

## Retrospective

- **Went well:** finding the conflict with SWHR8-C-0160 at planning (SD2) and choosing the legacy two-step flow let one FEATURE dispatch satisfy both locked suites without a dispute.
- **Went well:** the locked test fixed the module boundary, so the plan only had to add the database adapters. The whole sprint ran from plan to QA in about 20 minutes.
- **Went well:** the planning-time Key Decision (decisions travel only on the outbox) gives the next three capabilities one integration point.
- **Could improve:** the FEATURE edited `server/checkout/xml.ts`, which was outside its ownership map. The plan should have listed it, because the approval parser depends on it.
- **Could improve:** code review on both the FEATURE and QA was by inspection only, with no independent reviewer.
- **Could improve:** coverage is still unmeasured. Adding `@vitest/coverage-v8` would give QA a number.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                      |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0008-order-approval/`, `artifacts/SWHR8-S-0007/SWHR8-T-0030/PLAN.md`                | Satisfied | —                                              |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0007/qa-test-report.md`                                                                    | Satisfied | Out-of-scope acceptance failures as warnings   |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0007/SWHR8-T-0030/tdd-test-result.md`, `artifacts/SWHR8-S-0007/integration-test-result.md` | Satisfied | —                                              |
| Design conformance checked     | No approved mockups for this capability           | —                                                                                                             | N/A       | Capability has no screens                      |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0007/integration-defects-resolution.md`                                                    | Satisfied | —                                              |
| Spec discrepancies logged      | SD1–SD8 in change design                          | change `swhr8-i-0008-order-approval` design.md                                                                | Satisfied | SD1, SD3 resolved by planning, not by a ruling |
