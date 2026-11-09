---
artifact: qa-test-report
sprint: SWHR8-S-0001
ticket: SWHR8-T-0004
author: validation
---

# QA test report — SWHR8-S-0001

## Executive Summary

Sprint goal SWHR8-I-0002 (landing page and shared site shell, FEATURE SWHR8-T-0002) verified on the integrated sprint branch. Install, build, lint, typecheck, unit tests and the project Playwright suite all pass. All five scenarios of the change are exercised by passing tests. No defects found. Locked acceptance failures for other capabilities are warnings (enforced only at release UAT).

## E2E Test Status

Command: `bun run test:e2e` → `7 passed (3.5s)`, exit 0, 0 skipped. Detail in `integration-test-result.md`.

Warnings (acceptance tests, enforced only at UAT, not fixed here):

- `bun run test:acceptance`: `Test Files 33 failed | 2 passed (35); Tests 226 failed | 3 passed (229)`. The failures are in capabilities not yet built (e.g. `Cannot find module '/routes/api/populate'`). The two `tests/acceptance/site-shell` vitest files pass (3 tests).
- `tests/acceptance/site-shell/landing-and-navigation.spec.ts` never runs: `playwright.acceptance.config.ts` has `testMatch: "**/e2e/**/*.spec.ts"`, and the spec is not under an `e2e/` directory. `bun run test:acceptance:e2e` exits 0 with "No tests found". The browser behaviour is covered by `e2e/home.spec.ts` instead.

## Unit Test Results

`bun run test`: `Test Files 14 passed (14)`, `Tests 34 passed (34)`, exit 0.
`bun run lint` exit 0; `bun run typecheck` exit 0; `bun run build` exit 0.

## Code Review

Not a line-by-line review of merged tickets. Verified by inspection that routes, shell and state frames exist and the tests above exercise them. No findings.

## Coverage Summary

Coverage was not measured: no coverage run produced a report in this environment, so no percentage is claimed. Scenario coverage: 5 of 5 scenarios have a passing test.

## Issues Found

No defects. Warnings only: the two acceptance items under E2E Test Status.
Design: `design-check.md` from T-0002 records omissions caused by unbuilt areas (design.md D1: nav shows Home and Language only). No design reference deviation was fixed or newly found by this pass; no paired screenshots were re-rendered, the T-0002 ones were reviewed.

SPEC-GAP: none

## Recommendation

Pass: fire `validation.all_acs_passed`. This is backed by the executed runs above; it says nothing about the other capabilities' acceptance suites, which are triaged at UAT.

SCENARIO-VERDICT: Landing page / A user opens the root route — pass
SCENARIO-VERDICT: Global navigation / Navigation is present on every page — pass
SCENARIO-VERDICT: Shared page layout / A page renders inside the shell — pass
SCENARIO-VERDICT: Shared state frames / A page has nothing to show — pass
SCENARIO-VERDICT: Shared state frames / A page fails to load — pass
