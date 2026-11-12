---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0006
capability_brief: SWHR8-I-0007
branch: vortex/sprint/swhr8-s-0006-d274d8d7
upstream: [artifacts/SWHR8-S-0006/SPRINT-PLAN.md, artifacts/SWHR8-S-0006/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0006/release-notes.md]
---

# Sprint summary — SWHR8-S-0006

Sprint goal met. A shopper can now turn the cart into an order from one pre-filled checkout form and get an order number and the bill-to e-mail back. The order carries the fixed card, is handed to order processing as a queued message and is stored there as PENDING. QA passed all 34 scenario verdicts with no defects. The two cart cases deferred from SWHR8-S-0005 (C-0077, C-0082) now pass.

## Tickets

| Ticket       | Type    | Title                                | Outcome                                                            |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------ |
| SWHR8-T-0025 | TASK    | Sprint plan — SWHR8-S-0006           | DONE (commit d61634d)                                              |
| SWHR8-T-0026 | FEATURE | Order checkout and payment details   | DONE (PR #30, commit 5512dc2); detail in `SWHR8-T-0026/summary.md` |
| SWHR8-T-0027 | TASK    | Integration QA report — SWHR8-S-0006 | DONE (PR #32, commit 674579f)                                      |
| SWHR8-T-0028 | TASK    | Sprint close bundle — SWHR8-S-0006   | this ticket                                                        |

## What shipped

Against SWHR8-I-0007 (change `swhr8-i-0007-order-checkout-and-payment`). SWHR8-T-0026 delivered every task:

- **Order data.** Seven order tables in one migration (`drizzle/0003_*`), order-owned contacts and card separate from the customer's (design.md O2, S8). All access through `server/checkout/repository.ts`.
- **Placing an order.** `server/checkout/service.ts` checks an empty cart, then the required billing and shipping fields, then draws the order number from the `"1001"` counter (first number 1001), prices the lines in integer cents, attaches the fixed card and stamps the order (O3 to O6).
- **Hand-off.** The order goes as purchase-order XML through an in-process outbox (`order_message`). Receipt stores it as PENDING; failed receipts retry and redelivery is ignored (O7, O8).
- **HTTP.** `POST /api/checkout`, `GET /api/checkout/queue`, `GET /api/account/profile`. A concurrent second submit from one session gets 409.
- **Screens.** `/order` (sign-on gate from the cart), `/checkout` form pre-filled from the profile with a missing-fields list, `/checkout/confirmation` with the order number and bill-to e-mail. The session cart is emptied after hand-off. Strings in en_US, ja_JP and zh_CN.
- **Carried cases closed.** C-0077 (empty-cart order rejected) and C-0082 (cart cleared after hand-off), deferred from SWHR8-S-0005, now pass.

## Divergence from plan

None in scope. The planned spec discrepancies were built as design.md recorded them: first order number 1001 per C-0170 (S1), checkout form and API open to signed-out sessions with the sign-on gate on `/order` (S2), empty-cart check on submit rather than before the form (S3), no new navigation entry (S4), country derived from locale (S5). The FEATURE added two things not in the plan: a per-session in-flight guard (409) found in code review, and a one-line wait fixing a pre-existing race in the localization E2E spec (C-0022) that the extra E2E load exposed.

## Verification

PASS. See `qa-test-report.md`. 34 of 34 scenario verdicts pass. Lint, typecheck and build are clean, 267 of 267 unit tests and 24 of 24 E2E tests pass, and there are no defects (`integration-defects-resolution.md`). Every locked order-checkout acceptance test passes. QA re-viewed the MCK-43 pair itself (match); MCK-44 to MCK-50 rest on the FEATURE's paired screenshots (`SWHR8-T-0026/design-check.md`). Coverage was not measured.

## Known findings carried forward

Not defects in this sprint's code, but they should not be lost:

- **Locked acceptance failures outside this capability** (warnings, triaged at UAT): 10 Playwright and 121 vitest failures, almost all in capabilities not built yet (admin-order-management, order-approval, order-fulfillment, order-notifications, inventory-reporting, order-reporting-batch). Three touch built capabilities and need triage: C-0022 (locale screen expects de_DE as well), C-0034 (register after requesting the order page should return there) and C-0108 (bill-to e-mail on the confirmation, owned by order-notifications). The list is in `qa-test-report.md`.
- **Business Owner decisions still open:** the first order number (S1) and the fixed card on every order (S10). Both are built as specified and listed in PRODUCT.md open questions.
- **Checkout accepts a signed-out session** at `/checkout` and `POST /api/checkout` because the locked tests require it (S2). Only `/order` gates on sign-on.
- **A failed hand-off after the number was drawn leaves a gap** in the order-number sequence. Accepted in code review; the cart is kept (O9).
- **SWHR8-T-0024** (drop carts of expired anonymous sessions), raised last sprint, is still in BACKLOG.

## Defects Raised

None. No DEFECT ticket was created during the sprint window, which started 2026-11-11T16:08Z.

## Retrospective

- **Went well:** one FEATURE dispatch delivered the whole change (migration, six server modules, three routes, three screens, outbox) and closed the two cases carried from the cart sprint, as planned in the cart sprint's K8 boundary.
- **Went well:** planning wrote the spec conflicts down as S1 to S10 before execution, so the FEATURE built to the locked tests without stopping on a dispute.
- **Went well:** QA compared one mockup itself this time, after two sprints with none.
- **Could improve:** QA still compared only one of eight mockups. The other seven rest on the implementer's check.
- **Could improve:** an E2E race in localization (C-0022) only surfaced when the suite grew. Specs that wait on async options should wait for them from the start.
- **Could improve:** three locked acceptance failures in already-built capabilities (C-0022, C-0034, C-0108) keep rolling forward as warnings. They should be classified rather than carried again.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                    |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0007-order-checkout-and-payment/`, `artifacts/SWHR8-S-0006/SWHR8-T-0026/PLAN.md`    | Satisfied | —                                            |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0006/qa-test-report.md`                                                                    | Satisfied | Out-of-scope acceptance failures as warnings |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0006/SWHR8-T-0026/tdd-test-result.md`, `artifacts/SWHR8-S-0006/integration-test-result.md` | Satisfied | —                                            |
| Design conformance checked     | Paired mockup/built screenshots, QA re-view       | `artifacts/SWHR8-S-0006/SWHR8-T-0026/design-check.md`                                                         | Satisfied | QA re-viewed MCK-43 only                     |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0006/integration-defects-resolution.md`                                                    | Satisfied | —                                            |
| Open business decisions logged | S1, S10 in design and PRODUCT.md open questions   | `PRODUCT.md`, change design.md                                                                                | Satisfied | Awaiting Business Owner ruling               |
