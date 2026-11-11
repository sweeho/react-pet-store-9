---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0002
capability_brief: SWHR8-I-0003
branch: vortex/sprint/swhr8-s-0002-885750e9
upstream: [artifacts/SWHR8-S-0002/SPRINT-PLAN.md, artifacts/SWHR8-S-0002/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0002/release-notes.md]
---

# Sprint summary — SWHR8-S-0002

Sprint goal met: the store now runs in en_US, ja_JP and zh_CN. Shoppers can change language on `/locale`, and the session keeps the choice for 30 minutes of inactivity. QA passed all 27 scenarios and found no defects.

## Tickets

| Ticket       | Type    | Title                                                                                                   | Outcome                                                             |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| SWHR8-T-0007 | TASK    | Sprint plan — SWHR8-S-0002                                                                              | DONE (commit b4bd581)                                               |
| SWHR8-T-0003 | DEFECT  | Acceptance Playwright config never matches any capability's acceptance spec                             | DONE (PR #17, commit 50b801f); detail in `SWHR8-T-0003/fix-note.md` |
| SWHR8-T-0008 | FEATURE | Localization — locale model, session locale, Language page, catalog text, encoding, formatting and mail | DONE (PR #18, commit 6faeef6); detail in `SWHR8-T-0008/summary.md`  |
| SWHR8-T-0009 | TASK    | Integration QA report — SWHR8-S-0002                                                                    | DONE (PR #20, commit b26fc62)                                       |
| SWHR8-T-0010 | TASK    | Sprint close bundle — SWHR8-S-0002                                                                      | this ticket                                                         |

## What shipped

Against the goal of SWHR8-I-0003 (change `swhr8-i-0003-localization`; all 14 tasks were delivered by SWHR8-T-0008):

- **Locale model and session.** `server/localization/` holds the configured locales (en_US, ja_JP, zh_CN, default en_US, overridable via `LOCALES`/`DEFAULT_LOCALE`) and the locale code parsing (`language_COUNTRY` or `default`). It also holds a cookie-addressed session with a 30-minute idle timeout. `middleware/locale.ts` applies the default locale and a one-request `?locale=` override on every request.
- **API.** `GET /api/session -> { locale }`, `POST /api/locale` (400 "Unable to change the language" on an unparseable or missing code, session unchanged), and `GET /api/locales` with the configured list.
- **Screens.** A `src/i18n/` provider with `useScreen()` and en_US, ja_JP and zh_CN dictionaries. de_DE falls back to en_US. `<html lang>` follows the resolved locale, and the shell and landing page are translated.
- **Language page** at `/locale`, with `/localization` kept as an alias. It has a selection view, a confirmation showing the previous and new locale, an error alert, a header language control and a footer "Change language" link.
- **Catalog text** stored per (entity, id, locale). It returns only the requested locale, never falls back, and rejects a null locale.
- **Encoding and formatting.** UTF-8 form reading, SJIS and JIS decoding (JIS through a small converter, because Bun cannot decode ISO-2022-JP), and locale-aware currency, number and keyword formatting.
- **Order mail.** The template is chosen by the order locale, and production fails when none exists. `sessions.changeLocale` is the hook customer account calls when a profile is saved.
- **Acceptance harness fix** (SWHR8-T-0003). The acceptance Playwright config now finds the capability specs, so browser acceptance cases run for every capability.

## Divergence from plan

The FEATURE followed decisions L1–L11 in the change's `design.md`. Visible differences:

- **Choice control (S1).** The page uses a native `<select>` instead of the mockups' radio cards, because the locked tests require one. QA recorded this as the residual for SWHR8-MCK-15/16. The other mockup differences (unbuilt nav entries, no "Browse the catalog" action) are listed in `SWHR8-T-0008/design-check.md`.
- **Test location.** Unit tests for `server/localization/` live in `routes/localization/*.test.ts`, not beside the modules. The project's test-evidence globs class `server/**` as production code, so the red check would have rejected tests there. `vitest.config.ts` was therefore left unchanged.
- **Deferred cases.** SWHR8-C-0018 moves to SWHR8-I-0005, and SWHR8-C-0019/C-0020 move to SWHR8-I-0004. Each needs a page those capabilities build (`/account` with sign-on, `/catalog`). Their behaviour is covered here at unit level.

## Verification

PASS. See `qa-test-report.md`: 27/27 scenario verdicts pass, unit 98/98, e2e 13/13, and lint, typecheck and build are clean. No defects (`integration-defects-resolution.md`). The green run was valid, and its locked acceptance run passed for all 24 linked cases. The repo-wide acceptance suite still fails for capabilities not yet built, which is expected and triaged at UAT. Coverage was not measured.

## Defects Raised

None this sprint. SWHR8-T-0003, carried from SWHR8-S-0001, was fixed.

## Retrospective

- **Went well:** the locked acceptance tests fixed the module boundaries, and planning wrote them into `design.md` and PLAN.md. The FEATURE landed in one dispatch, and QA found nothing.
- **Went well:** finding the Bun ISO-2022-JP gap during planning turned task 4.3 from an open question into a decided step, so no SPIKE was needed.
- **Could improve:** planning put unit tests beside `server/` modules without checking the project's test-evidence globs, so the implementer had to move them. Any later capability that adds `server/<cap>/` modules hits the same rule. The plan should say "tests under `routes/`" until the globs include `server/`.
- **Could improve:** the approved mockups drew a radio list while the locked test required a `<select>`. Mockup review and test authoring should agree on the control before a sprint starts.
- **Could improve:** sessions are in memory and are never pruned (noted in `SWHR8-T-0008/summary.md`). That is acceptable at this scale, but it needs revisiting before production, and the session cookie is not `Secure`.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                       |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0003-localization/`, `artifacts/SWHR8-S-0002/SWHR8-T-0008/PLAN.md`                  | Satisfied | —                                               |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0002/qa-test-report.md`                                                                    | Satisfied | 3 browser cases deferred to SWHR8-I-0004/I-0005 |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0002/SWHR8-T-0008/tdd-test-result.md`, `artifacts/SWHR8-S-0002/integration-test-result.md` | Satisfied | —                                               |
| Design conformance checked     | Paired mockup/built screenshots                   | `artifacts/SWHR8-S-0002/SWHR8-T-0008/design-check.md`                                                         | Satisfied | Select instead of radio cards (S1)              |
| Defects dispositioned          | 0 found in QA; 1 carried defect fixed             | `artifacts/SWHR8-S-0002/integration-defects-resolution.md`, `artifacts/SWHR8-S-0002/SWHR8-T-0003/fix-note.md` | Satisfied | —                                               |
