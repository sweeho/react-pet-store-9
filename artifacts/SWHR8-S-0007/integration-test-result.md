---
artifact: integration-test-result
sprint: SWHR8-S-0007
ticket: SWHR8-T-0031
author: validation
---

# Integration test result

Command: `bun run test:e2e -- --project=chromium` (after `bun install` and `bun run build`, both exit 0)

Summary line: `24 passed (7.0s)` — 0 failed, 0 skipped.

| Spec file                | Result |
| ------------------------ | ------ |
| e2e/account.spec.ts      | pass   |
| e2e/cart.spec.ts         | pass   |
| e2e/catalog.spec.ts      | pass   |
| e2e/checkout.spec.ts     | pass   |
| e2e/home.spec.ts         | pass   |
| e2e/localization.spec.ts | pass   |
| e2e/smoke.spec.ts        | pass   |

Per-spec rows are by file (24 tests in 7 files per `playwright test --list`; every file ran, none wholly skipped). This sprint adds no screens; order approval has no browser spec.

E2E-RESULT: chromium 24 passed, 0 failed, 0 skipped
