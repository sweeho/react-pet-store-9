---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0008
capability_brief: SWHR8-I-0009
branch: vortex/sprint/swhr8-s-0008-6b84cd7f
upstream: [artifacts/SWHR8-S-0008/SPRINT-PLAN.md, artifacts/SWHR8-S-0008/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0008/release-notes.md]
---

# Sprint summary — SWHR8-S-0008

Sprint goal met. The store can now e-mail customers when an order is approved or denied, shipped, or completed. Each e-mail has its own switch, and every switch is off by default, so under the default configuration no mail is sent, as in the legacy store. Mail goes to the order's bill-to e-mail, in the order's language, as HTML. A delivery failure is logged and dropped without holding up the order. QA passed all 10 scenario verdicts with no defects.

## Tickets

| Ticket       | Type    | Title                                | Outcome                                                            |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------ |
| SWHR8-T-0033 | TASK    | Sprint plan — SWHR8-S-0008           | DONE (commit da78fd1)                                              |
| SWHR8-T-0034 | FEATURE | Customer notifications               | DONE (PR #37, commit b51a327); detail in `SWHR8-T-0034/summary.md` |
| SWHR8-T-0035 | TASK    | Integration QA report — SWHR8-S-0008 | DONE (PR #38, commit 61b5dee)                                      |
| SWHR8-T-0036 | TASK    | Sprint close bundle — SWHR8-S-0008   | this ticket                                                        |

## What shipped

Against SWHR8-I-0009 (change `swhr8-i-0009-customer-notifications`). SWHR8-T-0034 delivered all 18 tasks:

- **Mailer.** `server/notifications/mailer.ts` holds a local Mail document parser and `validateMail`, which requires Address, Subject and Content in that order. `sendMail` sends `text/html` to each comma-separated recipient from the configured sender. `processMailRequest` treats a malformed request as an error and sends nothing; it logs a delivery failure and drops it without retry (design.md N2, N3).
- **Order-status mail.** `server/notifications/order-mail.ts`:
  - **Switches:** `SEND_APPROVAL_MAIL`, `SEND_CONFIRMATION_MAIL` and `SEND_COMPLETED_ORDER_MAIL`, read from the environment and off by default.
  - **Subjects:** "Java Pet Store Order Status / Shipped / COMPLETED: <id>".
  - **Templates:** per-locale HTML for en_US, ja_JP and zh_CN (`templates.ts`) (N4–N6).
- **Queues.** The approval drain now also publishes each decision on `order-status-mail`, in the same transaction; `order-decision` is unchanged (N7). `server/notifications/queue.ts` drains `order-status-mail` into Mail documents on `mail`, and drains `mail` through the SMTP transport (N8).
- **SMTP.** New `nodemailer` dependency, configured by `MAIL_SMTP_URL` and `MAIL_SENDER`. With no URL set, every send fails, and the failure is logged and dropped (N9).
- **Bill-to e-mail.** Already stored and shown since SWHR8-S-0006. It is now covered by `src/test/server/notifications/bill-to.test.ts`. No routes or pages were added (N10).

## Divergence from plan

- `server/approval/queue.ts` and `server/notifications/queue.ts` import each other, for function-level use only. A dynamic import left exports undefined under Vitest. This is disclosed by the implementer and noted by QA as acceptable.
- Otherwise built as planned. SD1 to SD6 were resolved as `design.md` recorded them. The locked C-0108 browser test was disputed rather than built (SD1).

## Verification

PASS. See `qa-test-report.md`. All 10 scenario verdicts pass. `bun run verify` is clean with 311 of 311 unit tests passing. E2E passes 24 of 24 (no spec targets this capability, which has no UI). The order-notifications locked vitest files pass. There are no defects (`integration-defects-resolution.md`). Coverage was not measured.

## Known findings carried forward

These are not defects in this sprint's code, but they should not be lost:

- **The C-0108 locked browser test is under dispute.** It assumes `POST /api/orders`, `GET /api/orders/:id` and `/orders/:id`, which the app does not have and should not add (SD1). It stays red until the Test Author amends it to the checkout flow.
- **Shipped and completed mails have no publisher yet.** Fulfilment (SWHR8-I-0010) must publish `shipped` and `completed` OrderEvents on `order-status-mail`. Until then only approval and denial mail can fire.
- **The `received` event sends nothing** even with the confirmation switch on, because the spec defines no received-order mail (SD2). The locked test and the brief disagree on what the confirmation switch means; a Business Owner ruling would settle it.
- **Circular import** between `server/approval/queue.ts` and `server/notifications/queue.ts`. It works today, but a fourth consumer should get a neutral dispatch module instead.
- **Locked acceptance failures in later capabilities** (warnings, triaged at UAT): 89 vitest failures in 19 files. Three of those cases send mail from other capabilities (C-0126, C-0127, C-0195).
- **Carried from earlier sprints:** C-0022 and C-0034 are unclassified; SWHR8-T-0024 is still in BACKLOG; SD1 and SD3 of order approval are not ruled on.

## Defects Raised

None. No DEFECT ticket was created during the sprint window, which started 2026-11-12T05:30Z.

## Retrospective

- **Went well:** planning found at Stage 0 that a queue row has one delivery status and decided one-queue-per-consumer before the FEATURE ran, so fulfilment inherits a clean queue instead of a race.
- **Went well:** finding the C-0108 contract conflict at planning meant the FEATURE disputed one test instead of adding a second, unvalidated order endpoint.
- **Went well:** one FEATURE dispatch delivered the whole change. The sprint ran from plan to QA in about 20 minutes.
- **Could improve:** planning cannot file a test dispute itself, so a conflict it has already diagnosed waits for the implementer's run. The platform could let planning file it.
- **Could improve:** the drains now reference each other. A shared dispatch point would avoid the circular import as more consumers arrive.
- **Could improve:** code review was again by inspection only, and coverage is still unmeasured.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                    |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0009-customer-notifications/`, `artifacts/SWHR8-S-0008/SWHR8-T-0034/PLAN.md`        | Satisfied | —                                            |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0008/qa-test-report.md`                                                                    | Satisfied | Out-of-scope acceptance failures as warnings |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0008/SWHR8-T-0034/tdd-test-result.md`, `artifacts/SWHR8-S-0008/integration-test-result.md` | Satisfied | —                                            |
| Design conformance checked     | No approved mockups for this capability           | —                                                                                                             | N/A       | Capability has no screens                    |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0008/integration-defects-resolution.md`                                                    | Satisfied | —                                            |
| Spec discrepancies logged      | SD1–SD6 in change design                          | change `swhr8-i-0009-customer-notifications` design.md                                                        | Satisfied | C-0108 test dispute awaiting the Test Author |
