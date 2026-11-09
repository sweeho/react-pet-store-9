---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0001
capability_brief: SWHR8-I-0002
branch: vortex/sprint/swhr8-s-0001-adec0dd3
upstream: [artifacts/SWHR8-S-0001/SPRINT-PLAN.md, artifacts/SWHR8-S-0001/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0001/release-notes.md]
---

# Sprint summary — SWHR8-S-0001

Sprint goal met: the Pet Store has a landing page at `/`, and every page renders inside one shared shell with shared empty, error and loading frames. QA passed all 5 scenarios and found no defects.

## Tickets

| Ticket       | Type    | Title                                         | Outcome                                                            |
| ------------ | ------- | --------------------------------------------- | ------------------------------------------------------------------ |
| SWHR8-T-0001 | TASK    | Sprint plan — SWHR8-S-0001                    | DONE (commit 31eda79)                                              |
| SWHR8-T-0002 | FEATURE | Bootstrap, landing page and shared site shell | DONE (PR #14, commit edd3aa9); detail in `SWHR8-T-0002/summary.md` |
| SWHR8-T-0004 | TASK    | Integration QA report — SWHR8-S-0001          | DONE (PR #16, commit 6867850)                                      |
| SWHR8-T-0006 | TASK    | Sprint close bundle — SWHR8-S-0001            | this ticket                                                        |

## What shipped

Against the goal of SWHR8-I-0002 (change `swhr8-i-0002-bootstrap-landing-page-and`):

- A landing page at `/` that links to every primary area. Today that is one area, Language → `/localization`.
- A shared shell (`src/pages/_layout.tsx`), mounted once as the parent route. It provides the header with a store-name link to `/`, global navigation with a Home link (collapsing to a menu below `lg`) and a footer. Not-found renders inside it too.
- Shared `EmptyFrame`, `ErrorFrame` (with Try again) and `LoadingFrame` in `src/components/shell/`, plus the `useLoad` hook.
- A thin Localization entry page backed by `GET /api/locales`. It exists so the navigation leads somewhere real and the frame cases (C-0139, C-0140) have a page to run against.

## Divergence from plan

The FEATURE was built as planned in `design.md`. The decisions planning recorded there (D1 to D5) held. The visible ones:

- **D1:** the navigation, landing page and footer show only Home and Language, not the mockups' seven entries. Other areas join `PRIMARY_AREAS` as their capabilities ship.
- **Mockup differences:** the remaining differences from the mockups are listed per mockup in `SWHR8-T-0002/design-check.md`, and every one comes from unbuilt areas or placeholder copy.
- **Test change:** `src/pages/[...all].test.tsx` now wraps its page in `MemoryRouter`, because NotFound renders a `Link`.

## Verification

PASS. See `qa-test-report.md`: 5/5 scenario verdicts pass, unit 34/34, e2e 7/7, and lint, typecheck and build are clean. No defects were found (`integration-defects-resolution.md`). Coverage was not measured.

## Defects Raised

| Ticket       | Description                                                                                                                                                                                                                          | Filed by | Status  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- |
| SWHR8-T-0003 | `playwright.acceptance.config.ts` matches only `**/e2e/**/*.spec.ts`, so no capability's acceptance Playwright spec (including site-shell C-0136/C-0137) ever runs (design.md D4).                                                   | planning | BACKLOG |
| SWHR8-T-0005 | "Sprint QA not completed for SWHR8-S-0001: verify what it left unverified". It was filed while integration QA was running, and the QA report (T-0004) later reached a PASS verdict. Triage should check whether it is now redundant. | ideation | BACKLOG |

## Retrospective

- **Went well:** the planning `design.md` recorded the module contracts that the locked acceptance tests fix (the `_layout` default export, the frame `data-testid`s). The FEATURE landed in one dispatch with no rework, and QA found nothing.
- **Went well:** making the primary areas a data list (`PRIMARY_AREAS`) means every later capability adds a nav entry in one file. That resolved the mismatch between the mockups and the proposal (D1) without leaving dead links.
- **Could improve:** the acceptance Playwright config bug (SWHR8-T-0003) means browser acceptance cases cannot run in CI for any capability. It should be fixed before the next capability sprint relies on those cases.
- **Could improve:** T-0002's green run was recorded as `unofficial` because it changed `vite.config.ts`, and it needs a person's approval. A config edit that a plan explicitly calls for should not need a manual exception.
- **Could improve:** `tailwind.config.ts` exists although the docs say Tailwind is CSS-first (D5). No ticket tracks it yet.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                                             |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0002-bootstrap-landing-page-and/`, `artifacts/SWHR8-S-0001/SWHR8-T-0002/PLAN.md`    | Satisfied | —                                                                     |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0001/qa-test-report.md`                                                                    | Satisfied | Acceptance e2e spec not run by its config (SWHR8-T-0003)              |
| Tests executed                 | TDD result, integration test result               | `artifacts/SWHR8-S-0001/SWHR8-T-0002/tdd-test-result.md`, `artifacts/SWHR8-S-0001/integration-test-result.md` | Satisfied | Green run marked unofficial and awaiting human approval: Not Provided |
| Design conformance checked     | Paired mockup/built screenshots                   | `artifacts/SWHR8-S-0001/SWHR8-T-0002/design-check.md`                                                         | Satisfied | Differences documented (D1)                                           |
| Defects dispositioned          | 0 found in QA; 2 raised to backlog                | `artifacts/SWHR8-S-0001/integration-defects-resolution.md`                                                    | Satisfied | —                                                                     |
