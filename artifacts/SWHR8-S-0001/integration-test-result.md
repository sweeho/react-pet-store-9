---
artifact: integration-test-result
sprint: SWHR8-S-0001
ticket: SWHR8-T-0004
author: validation
---

# Integration test result

Command: `bun install && bun run build && bun run test:e2e` (Playwright project `chromium`, which covers all specs; `playwright test --list` showed 7 tests in 2 files).

Summary line: `7 passed (3.5s)`

| Spec              | Tests | Result   |
| ----------------- | ----- | -------- |
| e2e/home.spec.ts  | 4     | 4 passed |
| e2e/smoke.spec.ts | 3     | 3 passed |

No spec file was wholly skipped; skipped count 0. No failures.

E2E-RESULT: chromium 7 passed, 0 failed, 0 skipped
