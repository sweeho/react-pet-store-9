---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0009
capability_brief: SWHR8-I-0010
branch: vortex/sprint/swhr8-s-0009-2d54314a
upstream: [artifacts/SWHR8-S-0009/SPRINT-PLAN.md, artifacts/SWHR8-S-0009/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0009/release-notes.md]
---

# Sprint summary — SWHR8-S-0009

Sprint goal met. Approved orders are now fulfilled inside the store. Each approved order becomes a PENDING supplier order. A line ships in full only when stock covers it, and stock is deducted. Each attempt that ships something produces an invoice, and the order moves to partly shipped or completed. An administrator can set stock quantities on a new Inventory update screen behind a form login, and saving re-attempts every waiting supplier order. QA passed all 47 scenario verdicts and found no defects.

## Tickets

| Ticket       | Type    | Title                                | Outcome                                                            |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------ |
| SWHR8-T-0037 | TASK    | Sprint plan — SWHR8-S-0009           | DONE (commit 6b1a157)                                              |
| SWHR8-T-0038 | FEATURE | Order fulfillment and inventory      | DONE (commit 8a13f86); detail in `SWHR8-T-0038/summary.md`         |
| SWHR8-T-0039 | TASK    | Integration QA report — SWHR8-S-0009 | DONE (commit 29114a2)                                              |
| SWHR8-T-0040 | TASK    | Sprint close bundle — SWHR8-S-0009   | this ticket                                                        |

## What shipped

Against SWHR8-I-0010 (change `swhr8-i-0010-order-fulfillment-and-inven`). SWHR8-T-0038 delivered all 27 tasks:

- **Data.** New tables `supplier_contact`, `supplier_order` (status CHECK PENDING/COMPLETED), `supplier_line_item` and `user_role`. `inventory` keeps one row per item, now with CHECK `quantity >= 0` and no foreign key to `item` (design.md F4, F5). Migration `drizzle/0005_legal_kulan_gath.sql`. The seed adds the administrator `jps_admin`/`admin` and the roleless `customer`/`customer-password`.
- **Fulfilment core.** Pure modules in `server/fulfillment/` (service, documents, line-item, order-status, identifiers, process-manager, order-center, resources) over an injected store. `store.ts` loads, mutates and saves in one transaction (F1, F2).
- **Message flow.** `order-decision` → `supplier-purchase-order` → `invoice` → `order-status-mail`. The invoice drain sets SHIPPED_PART or COMPLETED, publishes `shipped` for every invoice and `completed` only when the order completes (F3). This gives the shipped and completed e-mails from SWHR8-S-0008 their publisher.
- **Administration.** `server/admin/auth.ts` (`requireAdministrator`: 401 signed out, 403 without the role), routes `POST /api/admin/signon`, `POST /api/admin/signoff`, `GET`/`POST /api/admin/inventory`, an `admin` field on `GET /api/session`, pages `/admin/login` and `/admin/inventory`, and an "Administration" navigation entry. Strings in en_US, ja_JP and zh_CN (F7–F9).

## Divergence from plan

- **`order-decision` is polled once a second** in addition to the on-enqueue and on-start drains, because the approval drain has no hook to signal fulfilment. `middleware/fulfillment.ts` starts the drains with the server. Disclosed by the implementer; recorded in ARCHITECTURE.md §Order fulfilment.
- A malformed document or unknown order marks its queue row `rejected` instead of retrying forever.
- `receivePurchaseOrder` throws `InvalidDocumentError` for a malformed order rather than returning `accepted: false`.
- Screen wording follows SD4: field label "Username", control "Log out" on every admin page, and an extra "Access denied" line on the refused frame. These are the locked test C-0229's requirements, not the mockups'.

## Verification

PASS. See `qa-test-report.md`. All 47 scenario verdicts pass. `bun run verify` exits 0 with 374 of 374 unit tests. E2E passes 26 of 26, including `e2e/admin-inventory-update.spec.ts` and `e2e/admin-inventory.spec.ts`. Every `tests/acceptance/order-fulfillment/` file passes, including the browser spec `inventory-admin.spec.ts`. No defects (`integration-defects-resolution.md`). Coverage was not measured.

Design: SWHR8-MCK-51 to 54 match. MCK-55 and MCK-56 (access refused) differ in wording only, per SD4. QA based this on the implementer's paired renders in `SWHR8-T-0038/design-check.md`, not on fresh renders of its own.

## Known findings carried forward

These are not defects in this sprint's code, but they should not be lost:

- **Mockup vs locked test wording (SD4).** "User name"/"Username", "Sign out"/"Log out" and the refused-frame heading disagree between MCK-51/53/55 and C-0229. The build follows the test. A design or test amendment would settle it.
- **One-second polling of `order-decision`.** It works, but a direct hand-off from the approval drain would remove the poll. The circular-import note from SWHR8-S-0008 points the same way: the drains want a shared dispatch point.
- **Locked acceptance failures in later capabilities** (warnings, triaged at UAT): 46 vitest failures in 14 files (admin-order-management, inventory-reporting, order-reporting-batch) and 8 browser failures (C-0252, 0256, 0259, 0260, 0265, 0266, C-0034, C-0108). None is in order-fulfillment.
- **Carried from earlier sprints:** the C-0108 test dispute (order-notifications SD1); no received-order e-mail (SD2); C-0022 and C-0034 unclassified; SWHR8-T-0024 still in BACKLOG.
- **The Administration nav entry points at `/admin/inventory`.** Admin order management (SWHR8-I-0011) is to repoint it to its `/admin` launcher and reuse `/admin/login`.

## Defects Raised

None. No DEFECT ticket was created during the sprint window, which started 2026-11-13T02:12Z.

## Retrospective

- **Went well:** planning settled the conflicts with the locked tests at Stage 0 (inventory shape SD2, cascade home SD3, login wording SD4, demo accounts SD5), so the FEATURE built against the tests without a dispute.
- **Went well:** one FEATURE dispatch delivered 27 tasks and 47 scenarios, about 4,950 lines with tests, in roughly 20 minutes. Plan to QA took about 45 minutes.
- **Went well:** the one-queue-per-consumer rule from the previous sprint let fulfilment add three queues and the mail fan-out without touching the approval or notification code paths.
- **Could improve:** the mockups and the locked E2E test were written independently and disagree on three strings. A check of design copy against the locked test text before the design is approved would avoid this.
- **Could improve:** QA again gave design verdicts from the implementer's screenshots rather than its own renders, and reviewed the code by inspection only. Coverage is still unmeasured.
- **Could improve:** the slug rule gave two mockups the same file name (SD9). The export rule needs a tie-break for the `-mobile` variant.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                    |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | change `swhr8-i-0010-order-fulfillment-and-inven`, `artifacts/SWHR8-S-0009/SWHR8-T-0038/PLAN.md`             | Satisfied | —                                            |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0009/qa-test-report.md`                                                                    | Satisfied | Out-of-scope acceptance failures as warnings |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0009/SWHR8-T-0038/tdd-test-result.md`, `artifacts/SWHR8-S-0009/integration-test-result.md` | Satisfied | —                                            |
| Design conformance checked     | Paired renders of 6 mockups                       | `artifacts/SWHR8-S-0009/SWHR8-T-0038/design-check.md`                                                         | Satisfied | MCK-53/55/56 wording per SD4                 |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0009/integration-defects-resolution.md`                                                    | Satisfied | —                                            |
| Spec discrepancies logged      | SD1–SD9 in change design                          | change `swhr8-i-0010-order-fulfillment-and-inven` design.md                                                   | Satisfied | SD4 awaiting a design or test amendment      |
