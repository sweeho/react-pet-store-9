---
artifact: integration-test-result
sprint: SWHR8-S-0006
ticket: SWHR8-T-0027
---

# Integration test result

Command: `bun run test:e2e` (after `bun install`, `bun run build`)

Summary: `24 passed (8.1s)`

| Spec                     | Tests | Result |
| ------------------------ | ----- | ------ |
| e2e/account.spec.ts      | 1     | pass   |
| e2e/cart.spec.ts         | 6     | pass   |
| e2e/catalog.spec.ts      | 2     | pass   |
| e2e/checkout.spec.ts     | 2     | pass   |
| e2e/home.spec.ts         | 4     | pass   |
| e2e/localization.spec.ts | 6     | pass   |
| e2e/smoke.spec.ts        | 3     | pass   |

No failures, no skips; every spec file ran its tests.

E2E-RESULT: chromium 24 passed, 0 failed, 0 skipped
