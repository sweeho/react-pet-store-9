---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0003
capability_brief: SWHR8-I-0004
branch: vortex/sprint/swhr8-s-0003-079c075b
upstream: [artifacts/SWHR8-S-0003/SPRINT-PLAN.md, artifacts/SWHR8-S-0003/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0003/release-notes.md]
---

# Sprint summary — SWHR8-S-0003

Sprint goal met. Shoppers can now browse categories, products and items, page through lists two at a time, open an item to see its list price and member price, and search by keyword, all in en_US, ja_JP or zh_CN. Operations have an on-demand catalog check. QA gave a verdict on all 18 scenarios: 17 pass and 1 is not testable yet (the MyList sidebar needs sign-on). QA found no defects.

## Tickets

| Ticket       | Type    | Title                                | Outcome                                                            |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------ |
| SWHR8-T-0011 | TASK    | Sprint plan — SWHR8-S-0003           | DONE (commit c874847)                                              |
| SWHR8-T-0012 | FEATURE | Catalog browsing and search          | DONE (PR #21, commit 2dc17ec); detail in `SWHR8-T-0012/summary.md` |
| SWHR8-T-0013 | TASK    | Integration QA report — SWHR8-S-0003 | DONE (PR #23, commit f9b8431)                                      |
| SWHR8-T-0014 | TASK    | Sprint close bundle — SWHR8-S-0003   | this ticket                                                        |

## What shipped

Against SWHR8-I-0004 (change `swhr8-i-0004-catalog-browsing-and-search`; every task was delivered by SWHR8-T-0012):

- **Data.** `category`, `product` and `item` tables, per-locale detail tables keyed by (id, locale) and an `inventory` table (`db/schema.ts`, migration `drizzle/0001_*`). The legacy sample catalog was converted to `db/seed/catalog.json` and is loaded when the catalog is empty.
- **Catalog module.** `server/catalog/` is the one read path (`createCatalog({ source })`). It handles locale filtering without fallback, alphabetical ordering, paging (page size 2, out-of-range pages return empty), any-word case-insensitive search, a blank query that returns nothing, and wrapping data-access failures in `CatalogError`. `store.ts` validates writes, including the mandatory fields on item locale records.
- **API.** `GET /api/catalog/categories`, `/category/:id`, `/product/:id`, `/item/:id`, `/search`. There is also a test-only `POST /api/test/seed`, which returns 404 in production.
- **Screens.** `/catalog`, `/category/:id` (with the MyList sidebar markup), `/product/:id`, `/item/:id` (list price and member price in locale currency) and `/search`. They use the shared empty and error frames with **Try again**, plus a global nav entry, the landing page's **Browse the catalog** button and strings in all three dictionaries.
- **Catalog check.** `server/jobs/catalog-check.ts` reports five headings (C1–C5) and returns a bit-coded exit code. Run it with `bun run catalog:check`.

## Divergence from plan

- **Seed upserts instead of replacing.** design.md C7 said replace. Parallel browser tests share one server, and a replace wiped another test's catalog.
- **No header search box.** The mockups put the box on the Catalog and Search pages, and the build follows them (design-check D7). DESIGN.md said "header search", so this close corrects it.
- **MyList sidebar not visible yet.** It renders only when the session reports MyList and a favourite category, and sign-on (SWHR8-I-0005) supplies those. A UI test with a stubbed session covers the markup. Locked case SWHR8-C-0233 fails for this reason.
- **Server unit tests live in `src/test/server/`**, because the platform does not count `server/**/*.test.ts` as tests. Last sprint the localization tests went under `routes/` for the same reason.
- Other mockup differences (no category blurbs, category id in breadcrumbs, no Add to cart, one state frame at a time) are D1–D10 in `SWHR8-T-0012/design-check.md`.

## Verification

PASS. See `qa-test-report.md`. Verdicts: 17 pass and 1 not-testable (MyList). `bun run verify` passed 145/145 unit tests with lint and typecheck clean, e2e passed 15/15 and the build is clean. No defects (`integration-defects-resolution.md`). The locked catalog acceptance tests pass 12/12, and browser cases C-0019, C-0020, C-0242, C-0244 and C-0247 pass. Repo-wide acceptance failures belong to capabilities not built yet and are triaged at UAT. Coverage was not measured.

## Known findings carried forward

Not defects in this sprint's code, but they should not be lost:

- **Seed data issues.** The catalog check reports real problems in the legacy seed: EST-15 has no ja_JP description, and EST-26 is priced below cost in ja_JP. They were left as is because they are legacy data.
- **SWHR8-C-0233 (MyList sidebar).** Re-verify once sign-on ships in SWHR8-I-0005.

## Defects Raised

None.

## Retrospective

- **Went well:** the FEATURE delivered the whole change (84 files, data through screens) in one dispatch, and QA found nothing to fix.
- **Went well:** the design-check listed each mockup difference with a code (D1–D10), so QA could give design verdicts without re-rendering the mockups.
- **Could improve:** planning wrote "header search" into DESIGN.md even though the mockups showed the box on the pages. Root-doc patterns written at planning should be checked against the approved mockups.
- **Could improve:** design.md C7 ("replace" seed) did not account for parallel browser tests sharing one server. Test-only data routes should be additive by default.
- **Could improve:** the test-evidence globs still exclude `server/**`, so each capability has to put its server tests somewhere else. This is the second sprint to hit it.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                 |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0004-catalog-browsing-and-search/`, `artifacts/SWHR8-S-0003/SWHR8-T-0012/PLAN.md`   | Satisfied | —                                         |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0003/qa-test-report.md`                                                                    | Satisfied | MyList scenario not testable until I-0005 |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0003/SWHR8-T-0012/tdd-test-result.md`, `artifacts/SWHR8-S-0003/integration-test-result.md` | Satisfied | —                                         |
| Design conformance checked     | Paired mockup/built screenshots                   | `artifacts/SWHR8-S-0003/SWHR8-T-0012/design-check.md`                                                         | Satisfied | Residuals D1–D10                          |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0003/integration-defects-resolution.md`                                                    | Satisfied | —                                         |
