# Fix note SWHR8-T-0003

Root cause: `playwright.acceptance.config.ts` testMatch was `**/e2e/**/*.spec.ts`, but specs live directly in `tests/acceptance/<capability>/`, so zero specs ran (green via --pass-with-no-tests).
Fix: testMatch `**/*.spec.ts`; vitest acceptance exclude changed to `tests/acceptance/**/*.spec.ts`; both header comments updated.
Files: playwright.acceptance.config.ts, vitest.acceptance.config.ts, src/test/acceptance-config.test.ts (regression test).
Note: newly discovered specs (41 tests in 9 files) may now fail; the CI step is continue-on-error.
CODE-REVIEW: self-review — diff is 4 config lines plus one small test, no sub-agent used; no findings, the regression test shells out to playwright (about 10s) which is acceptable.
