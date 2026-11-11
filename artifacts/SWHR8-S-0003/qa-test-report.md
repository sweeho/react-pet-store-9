---
sprint: SWHR8-S-0003
ticket: SWHR8-T-0013
author: validation
---

# QA test report — SWHR8-S-0003

## Executive Summary

Sprint goal "SWHR8-I-0004: Catalog browsing and search". On the integrated sprint branch, `bun run build`, `bun run verify` and `bun run test:e2e` all exit 0. All 17 catalog-browsing scenarios in the delta spec have a verdict (below); none failed. One locked acceptance case (SWHR8-C-0233, MyList sidebar) fails because sign-on (SWHR8-I-0005) is not built yet; this is a warning per the UAT-only policy. No defects were found.

## E2E Test Status

Command: `bun run test:e2e` → `15 passed (5.0s)`, 0 failed, 0 skipped. Details in `integration-test-result.md`.

Locked acceptance suite (warnings only, enforced at release UAT):

- `bun run test:acceptance` (vitest): 30 files / 191 tests fail, almost all for later capabilities whose modules do not exist yet (e.g. `/server/fulfillment/*`). `tests/acceptance/catalog-browsing/catalog.test.ts` run alone: 12 passed.
- `bun run test:acceptance:e2e` (Playwright): 10 passed, 31 failed (the log lists ✘ entries; later capabilities: cart, checkout, account, fulfillment, notifications). Catalog-relevant: [SWHR8-C-0233] MyList sidebar fails (no sign-on yet; design.md D6). [SWHR8-C-0244], [SWHR8-C-0242], [SWHR8-C-0247] pass. [SWHR8-C-0046] (account requires sign-on) fails, belongs to I-0005.

## Unit Test Results

`bun run verify` (lint + typecheck + unit): exit 0; `Test Files 34 passed (34)`, `Tests 145 passed (145)`.

## Code Review

Not a line-by-line review of merged tickets. Inspected by running: build clean, lint with `--max-warnings 0` clean, `tsc --build` clean. No restructuring or fixes were needed.

## Coverage Summary

No coverage command is declared for this project and none was run; no coverage figure is claimed.

## Issues Found

No defects. Warnings: acceptance failures listed under E2E Test Status (later capabilities / sign-on).

## Design fidelity

QA did not re-render the mockups; verdicts below rest on the implementation ticket's paired screenshots and difference list (`artifacts/SWHR8-S-0003/SWHR8-T-0012/design-check.md`, codes D1–D10).
DESIGN-VERDICT: SWHR8-MCK-19 differs — category list built per structure; D1,D2,D3,D5,D7,D8 remain (no blurbs, copy/token details)

- RESIDUAL: SWHR8-MCK-19 category blurbs — mockup: shows blurbs; built: names only
  DESIGN-VERDICT: SWHR8-MCK-20 differs — mobile category list; D1,D2,D3,D5,D8 remain
- RESIDUAL: SWHR8-MCK-20 see T-0012 design-check D1,D2,D3,D5,D8
  DESIGN-VERDICT: SWHR8-MCK-21 differs — MyList sidebar not shown (no sign-on yet, D4/D6)
- RESIDUAL: SWHR8-MCK-21 sidebar — mockup: shown; built: absent until I-0005
  DESIGN-VERDICT: SWHR8-MCK-22 differs — as MCK-21, mobile
- RESIDUAL: SWHR8-MCK-22 sidebar — mockup: shown; built: absent until I-0005
  DESIGN-VERDICT: SWHR8-MCK-23 differs — item list; see T-0012 design-check
- RESIDUAL: SWHR8-MCK-23 cart/quantity controls from later capabilities not built
  DESIGN-VERDICT: SWHR8-MCK-24 differs — item list mobile; see T-0012 design-check
- RESIDUAL: SWHR8-MCK-24 cart controls not built
  DESIGN-VERDICT: SWHR8-MCK-25 differs — item page labels unit cost "Member price" (D5); cart controls not built
- RESIDUAL: SWHR8-MCK-25 add-to-cart — mockup: shown; built: absent until cart ships
  DESIGN-VERDICT: SWHR8-MCK-26 differs — as MCK-25, mobile
- RESIDUAL: SWHR8-MCK-26 add-to-cart absent
  DESIGN-VERDICT: SWHR8-MCK-27 differs — search results; see T-0012 design-check
- RESIDUAL: SWHR8-MCK-27 see design-check
  DESIGN-VERDICT: SWHR8-MCK-28 differs — search results mobile; see T-0012 design-check
- RESIDUAL: SWHR8-MCK-28 see design-check
  DESIGN-VERDICT: SWHR8-MCK-29 differs — empty/error states; D1,D10
- RESIDUAL: SWHR8-MCK-29 see design-check D1,D10
  DESIGN-VERDICT: SWHR8-MCK-30 differs — as MCK-29, mobile; D1,D10
- RESIDUAL: SWHR8-MCK-30 see design-check D1,D10

## Regression guards

- SWHR8-T-0012 / SWHR8-C-0019 (new session is en_US; header language control): working. `src/i18n/locale-provider.test.tsx`, `src/pages/_layout.test.tsx` pass in `bun run verify`; e2e [SWHR8-C-0010] passes.
- SWHR8-T-0012 / SWHR8-C-0020 (ja_JP session uses Japanese screens): working. `locale-provider.test.tsx` passes; e2e [SWHR8-C-0023] passes.

## Scenario verdicts

Basis: unit/integration tests in `src/test/server/{catalog,store,catalog-check}.test.ts`, page tests, `routes/api/catalog/catalog.test.ts` (all inside the passing 145), the locked `catalog.test.ts` (12 pass), and `e2e/catalog.spec.ts`. Per-scenario mapping was by test titles carrying the case keys from T-0012's tdd-test-result; I did not individually re-trace each test to its assertion.

SCENARIO-VERDICT: Catalog page size / Catalog page size — pass
SCENARIO-VERDICT: MyList favourites / MyList favourites — not-testable sign-on (SWHR8-I-0005) not built; locked acceptance C-0233 fails for this reason
SCENARIO-VERDICT: Catalog consistency check / Catalog consistency check — pass
SCENARIO-VERDICT: Out-of-range page / Out-of-range page — pass
SCENARIO-VERDICT: Empty search query / Empty search query — pass
SCENARIO-VERDICT: Catalog structure / Catalog structure — pass
SCENARIO-VERDICT: Locale-specific listing / Locale-specific listing — pass
SCENARIO-VERDICT: Single entry lookup / Single entry lookup — pass
SCENARIO-VERDICT: Paged lists / Paged lists — pass
SCENARIO-VERDICT: Keyword search / Keyword search — pass
SCENARIO-VERDICT: Access modes / Access modes — pass
SCENARIO-VERDICT: Database-specific SQL / Database-specific SQL — pass
SCENARIO-VERDICT: Data-access failure / Data-access failure — pass
SCENARIO-VERDICT: Item locale record mandatory fields / Item locale record mandatory fields — pass
SCENARIO-VERDICT: Locale-specific catalog display / Locale-specific catalog display — pass
SCENARIO-VERDICT: Default page size and navigation / Default page size and navigation — pass
SCENARIO-VERDICT: Case-insensitive any-word search / Case-insensitive any-word search — pass
SCENARIO-VERDICT: Item page prices / Item page prices — pass

## Recommendation

Proceed. All checks that gate the sprint pass; the MyList scenario is deferred to sign-on (I-0005) and the acceptance failures are UAT-triaged warnings.
