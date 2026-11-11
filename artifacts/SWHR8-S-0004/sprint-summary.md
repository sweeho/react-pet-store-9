---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0004
capability_brief: SWHR8-I-0005
branch: vortex/sprint/swhr8-s-0004-17e72ca0
upstream: [artifacts/SWHR8-S-0004/SPRINT-PLAN.md, artifacts/SWHR8-S-0004/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0004/release-notes.md]
---

# Sprint summary — SWHR8-S-0004

Sprint goal met. Shoppers can now register, sign on, be returned to the page they asked for, keep their user name for 31 days, edit their profile and see their preferred language and banner applied, and sign off. Four screens need sign-on, and a signed-on session idle for 15 minutes is signed out. QA gave a verdict on all 39 scenarios: 38 pass and 1 cannot be tested yet (sign-off clearing a cart needs the cart). QA found no defects.

## Tickets

| Ticket       | Type    | Title                                | Outcome                                                            |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------ |
| SWHR8-T-0015 | TASK    | Sprint plan — SWHR8-S-0004           | DONE (commits 5f08322, e21487c)                                    |
| SWHR8-T-0016 | FEATURE | Customer account and sign-on         | DONE (PR #24, commit babfc2a); detail in `SWHR8-T-0016/summary.md` |
| SWHR8-T-0018 | TASK    | Integration QA report — SWHR8-S-0004 | DONE (PR #26, commit e43516d)                                      |
| SWHR8-T-0019 | TASK    | Sprint close bundle — SWHR8-S-0004   | this ticket                                                        |

## What shipped

Against SWHR8-I-0005 (change `swhr8-i-0005-customer-account-and-sign-o`). SWHR8-T-0016 delivered every task:

- **Data.** Tables `signon_user`, `customer`, `account`, `contact`, `address`, `credit_card` and `profile` (migration `drizzle/0002_*`). SQLite foreign keys are now enforced, so removing a customer removes its account, profile, contact, address and card. Sample users `j2ee` and `shopper` are seeded.
- **Server.** `server/customer/model.ts` holds the rules and defaults, `repository.ts` is the only code that touches the customer tables, and `auth.ts` keeps sign-on state on the existing `petstore_sid` session with a 15-minute idle expiry. Routes: `signon`, `signoff`, `register`, `customer`, `profile`, `users/:name`, and a test-only `test/clock` that returns 404 in production. `GET /api/session` gained sign-on, user name, profile preferences and `cartCount`.
- **Screens.** `/signon`, `/signon/error`, `/register`, `/account/new`, `/account/duplicate`, `/account` and `/signon/welcome`, with strings in en_US, ja_JP and zh_CN. The header has a Sign in link, or a "Hi, user name ▾" menu with My account and Sign off. A client guard sends protected routes to `/signon?next=`. The banner follows the banner flag and falls back to dogs.
- **Catalog follow-up closed.** The MyList sidebar from SWHR8-S-0003 now gets its data, and locked case SWHR8-C-0233 no longer appears among the acceptance failures.

## Divergence from plan

- **Registration returns straight to `next`** when it was reached from a protected page. Locked case C-0034 checks the URL path. Without a `next`, registration goes on to `/account/new` as planned.
- **The `/signon` → `/register` link is a full page load.** With a client-side transition, Playwright filled the old page's field before the new route was ready.
- **The administrator role (task 4.2) has no code**, as design.md A10 planned. C-0047 (sign-off clears the cart) is deferred to SWHR8-I-0006.
- **Code-review fixes in the FEATURE:** saving an unsupported language now returns 400 instead of success, a backslash open redirect in `next` is closed, and the user name is trimmed at sign-on.
- Screen text follows the locked tests where they differ from the mockups (design.md D1). Other mockup differences are in `SWHR8-T-0016/design-check.md`.

## Verification

PASS. See `qa-test-report.md`. Verdicts: 38 pass and 1 not-testable (Sign-off needs the cart). Lint and build are clean, 196 of 196 unit tests and 16 of 16 E2E tests pass, and there are no defects (`integration-defects-resolution.md`). In the locked acceptance tiers, the only customer-account failure is C-0047 (cart). The other failures belong to capabilities not built yet and are triaged at UAT. Design fidelity was compared visually only for MCK-31. MCK-32/33/35/37 were checked by heading only, and the rest were not compared by QA. The FEATURE's own design check covers all twelve. Coverage was not measured.

## Known findings carried forward

These are not defects in this sprint's code, but they should not be lost:

- **SWHR8-C-0047 (sign-off clears the cart).** Re-verify when the cart ships in SWHR8-I-0006.
- **Shared `shopper` user across parallel tests (design.md D9).** C-0018 saves `shopper` as ja_JP. On a long-lived dev database, later runs of C-0031 and the design-check screenshots then show Japanese text. CI uses a fresh database and passed.
- **SME questions still open:** the session timeout (15 minutes for sign-on vs 30 for locale, D3) and whether e-mail is mandatory on the contact (D5). Both are listed in PRODUCT.md open questions or design.md.
- **Clear-text passwords and card numbers** were kept for legacy parity (D6). The FEATURE also left a registration race and a possible partial customer write unfixed, and no follow-up ticket was raised for any of these.

## Defects Raised

None. No DEFECT ticket was created during the sprint window, which started 2026-11-11T07:09Z.

## Retrospective

- **Went well:** one FEATURE dispatch delivered the whole change (data, server, seven screens, three dictionaries), and QA found nothing to fix.
- **Went well:** planning named the locked tests' module boundaries, routes and labels up front, and the mockup-vs-test text conflicts (D1, D2). The build followed them without disputes.
- **Could improve:** QA compared only one mockup visually. Design fidelity for the other eleven rests on the implementer's own check.
- **Could improve:** locked browser tests share the `shopper` sample user and run in parallel, and one of them changes its language. Tests that mutate a shared user should create their own user.
- **Could improve:** the FEATURE's code review left two known minor risks (registration race, partial customer write) without a follow-up ticket. Risks that are found but left alone should always get an improvement ticket.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                  |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------ |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0005-customer-account-and-sign-o/`, `artifacts/SWHR8-S-0004/SWHR8-T-0016/PLAN.md`   | Satisfied | —                                          |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0004/qa-test-report.md`                                                                    | Satisfied | Sign-off/cart not testable until I-0006    |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0004/SWHR8-T-0016/tdd-test-result.md`, `artifacts/SWHR8-S-0004/integration-test-result.md` | Satisfied | —                                          |
| Design conformance checked     | Paired mockup/built screenshots                   | `artifacts/SWHR8-S-0004/SWHR8-T-0016/design-check.md`, `artifacts/SWHR8-S-0004/qa/design/`                    | Satisfied | QA inspected MCK-31 only; residuals listed |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0004/integration-defects-resolution.md`                                                    | Satisfied | —                                          |
