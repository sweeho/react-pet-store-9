---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0010
capability_brief: SWHR8-I-0011
branch: vortex/sprint/swhr8-s-0010-4eb2e1df
upstream: [artifacts/SWHR8-S-0010/SPRINT-PLAN.md, artifacts/SWHR8-S-0010/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0010/release-notes.md]
---

# Sprint summary — SWHR8-S-0010

Sprint goal met. Administrators now have an Administration area at `/admin`, behind the administrator role. It has a launcher (Manage orders / Log out), order lists for Pending, Approved, Denied and Completed with counts, and approve/deny of pending orders. Committed decisions are queued for order processing as an OrderApproval document. The area also warns on Refresh when decisions are unsaved, and shows revenue or quantity sales totals by category or item. An administrator idle for 54 minutes is signed out. QA passed all 23 scenario verdicts and found no defects.

## Tickets

| Ticket       | Type    | Title                                                                                 | Outcome                                                    |
| ------------ | ------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| SWHR8-T-0041 | TASK    | Sprint plan — SWHR8-S-0010                                                            | DONE (commit d260eaf)                                      |
| SWHR8-T-0042 | FEATURE | Admin order management — administration area, order lists, approve/deny, sales totals | DONE (commit febf6cf); detail in `SWHR8-T-0042/summary.md` |
| SWHR8-T-0044 | TASK    | Integration QA report — SWHR8-S-0010                                                  | DONE (commit 375404e)                                      |
| SWHR8-T-0045 | TASK    | Sprint close bundle — SWHR8-S-0010                                                    | this ticket                                                |
| SWHR8-T-0043 | TASK    | Approval drain retries a non-decision status forever (improvement)                    | BACKLOG, not committed to this sprint                      |

## What shipped

This sprint delivered SWHR8-I-0011 (change `swhr8-i-0011-admin-order-management`). SWHR8-T-0042 delivered all 16 tasks:

- **Rules.** Pure modules in `server/lib/admin-{session,launcher,requests,orders,sales}.ts`, with the signatures the locked acceptance tests fix (design.md M1).
- **Database and hand-off.** `server/admin/orders.ts` reads orders and sales lines and holds the production publish. The publish puts one `<OrderApproval>` on the existing `order-approval` queue and schedules the drain. Statuses are XML-escaped (M4–M6).
- **Session.** `server/admin/auth.ts` records the admin sign-on's last use and drops it after 54 idle minutes, measured on the per-session test clock (M2).
- **Routes.** `POST /api/admin/launch`, `GET /api/admin/orders?status=`, `POST /api/admin/update-status` and `GET /api/admin/sales`. Every one answers 401 when no admin is signed on and 403 without the role (M3, M7).
- **Pages.** `/admin` is the launcher, with the sign-on form shown in place when the visitor is not an administrator. The others are `/admin/orders`, `/admin/sales` and `/admin/logout`. The sign-on form is now shared with `/admin/login`. The Administration nav entry now points at `/admin`. Strings are in en_US, ja_JP and zh_CN (M8, M9).
- No schema change, no migration and no new dependency.

## Divergence from plan

- **`server/admin/orders.ts` is a file outside the ownership map.** The implementer kept the database reads and the queue write out of `server/lib/`, so the rule modules stay database-free. ARCHITECTURE.md is updated to match.
- **Unit tests for `server/lib` live in `src/test/server/admin-lib/`.** The platform's red check does not count `server/**/*.test.ts` as tests.
- **Screen differences that the locked tests force.**
  - The button reads "Commit", not the mockup's "Commit changes", and it is never disabled.
  - The Refresh warning is a native `confirm` dialog (SD6).
- **Simplified sales view.** The sales page drops the mockup's Share column and bars and shows only key and total.

## Verification

PASS. See `qa-test-report.md`.

- All 23 scenario verdicts pass.
- `bun run verify` exits 0 with 405 of 405 unit tests passing.
- The project E2E suite passes 28 of 28, including `e2e/admin-orders.spec.ts`.
- `tests/acceptance/admin-order-management/` passes fully, both the unit tests and the browser tests.
- There were no defects (`integration-defects-resolution.md`).
- Coverage was not measured.

Design: QA marked SWHR8-MCK-57 (login), 61 (order lists), 63 (refresh warning) and 65 (sales) as differing. MCK-57 is a layout difference: the build shows one card headed "Administrator access required" where the mockup has a separate heading and an alert banner. QA based its verdicts on the implementer's paired renders in `SWHR8-T-0042/design-check.md`. The other mockups were not compared independently.

## Known findings carried forward

None of these is a defect that blocks this release, but none should be lost:

- **Task 4.2 is still open.** The Business Owner has not decided the precision of sales totals. The build sums in double precision, not the legacy single-precision float (SD4).
- **SWHR8-T-0043 (improvement, BACKLOG).** Update-status does not validate statuses, as the spec requires. A message with a status other than APPROVED or DENIED therefore stays queued and is retried on every drain, and the valid orders in the same document are never applied. Only a direct API call can trigger this; the UI offers only APPROVED and DENIED (SD3).
- **Orders are read outside the checkout repository.** `server/admin/orders.ts` reads `purchase_order` and `order_line_item` with `db` directly. The ARCHITECTURE Key Decision "Orders reach order processing only as queued messages" says later capabilities read orders through `server/checkout/repository.ts` only. Both reads also load every row and filter in memory, which will not scale with order volume.
- **The launch descriptor carries the session id** in a response body. It is returned only to a signed-on administrator of that session, with `no-store` (SD5).
- **Spec duplication (SD1).** "Find orders by status" now exists in both the order-approval and admin-order-management specs.
- **Design residuals for the design owner.** MCK-57 login layout, MCK-61 button label, MCK-63 dialog style, and the MCK-65 share column and bars.
- **Locked acceptance failures in other capabilities** (UAT warnings):
  - Vitest: 29 failures in 11 files, all in inventory-reporting and order-reporting-batch.
  - Browser: C-0108 (order-notifications). The admin-order-management browser failures listed last sprint (C-0252, 0256, 0259, 0260, 0265, 0266) now pass.
- **Carried from earlier sprints:** the C-0108 dispute, no received-order e-mail, C-0022 unclassified, and SWHR8-T-0024 still in BACKLOG.

## Defects Raised

None. No DEFECT ticket was created during the sprint window, which started 2026-11-13T03:34Z.

## Retrospective

- **Went well:** the locked acceptance tests already existed at planning. Planning wrote their contracts into PLAN.md, and the six browser cases that failed last sprint (C-0252 … C-0266) passed on the first QA run with no test dispute.
- **Went well:** a lot was reused. The admin login and role check came from SWHR8-S-0009, and the approval drain already applied decisions only to pending orders and fanned them out. The feature needed no schema change and no change to `server/approval/`.
- **Went well:** one FEATURE dispatch delivered 16 tasks and 23 scenarios, about 2,000 lines including tests. Plan to QA took about 20 minutes.
- **Could improve:** the mockups again disagree with the locked tests (button label, dialog style), as SD4 did last sprint. The design check against locked test text that last sprint recommended has not been introduced.
- **Could improve:** the ownership map did not anticipate a database adapter beside the pure `server/lib` modules. That adapter reads order tables directly, which no review caught before close. A planning-time note on where the database reads go would have avoided it.
- **Could improve:** QA again gave design verdicts from the implementer's screenshots and reviewed code by inspection only. Coverage is still unmeasured.
- **Could improve:** task 4.2 asks for a Business Owner decision. The platform ticks it when the FEATURE merges, so the open decision now looks closed in `tasks.md`.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                    |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | change `swhr8-i-0011-admin-order-management`, `artifacts/SWHR8-S-0010/SWHR8-T-0042/PLAN.md`                   | Satisfied | —                                            |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0010/qa-test-report.md`                                                                    | Satisfied | Out-of-scope acceptance failures as warnings |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0010/SWHR8-T-0042/tdd-test-result.md`, `artifacts/SWHR8-S-0010/integration-test-result.md` | Satisfied | —                                            |
| Design conformance checked     | Paired renders of 12 mockups                      | `artifacts/SWHR8-S-0010/SWHR8-T-0042/design-check.md`                                                         | Satisfied | MCK-57/61/63/65 residuals                    |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0010/integration-defects-resolution.md`                                                    | Satisfied | —                                            |
| Spec discrepancies logged      | SD1–SD8 in change design                          | change `swhr8-i-0011-admin-order-management` design.md                                                        | Satisfied | SD4 (task 4.2) awaiting Business Owner       |
