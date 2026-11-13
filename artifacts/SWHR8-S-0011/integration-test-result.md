---
artifact: integration-test-result
sprint: SWHR8-S-0011
ticket: SWHR8-T-0049
author: validation
---

# Integration test result — SWHR8-S-0011

Command (after `bun install` and `bun run build`, both exit 0): `bun run test:e2e` (`playwright test`, chromium project; `playwright test --list`: 28 tests in 10 files). Summary line verbatim: `28 passed (9.0s)`, exit 0, no skips reported. The sprint adds no screens; this run checks for regressions.

| Spec                               | Tests | Result |
| ---------------------------------- | ----- | ------ |
| e2e/smoke.spec.ts                  | 3     | passed |
| e2e/home.spec.ts                   | 4     | passed |
| e2e/localization.spec.ts           | 6     | passed |
| e2e/cart.spec.ts                   | 6     | passed |
| e2e/catalog.spec.ts                | 2     | passed |
| e2e/checkout.spec.ts               | 2     | passed |
| e2e/account.spec.ts                | 1     | passed |
| e2e/admin-orders.spec.ts           | 2     | passed |
| e2e/admin-inventory.spec.ts        | 1     | passed |
| e2e/admin-inventory-update.spec.ts | 1     | passed |

Locked acceptance browser tier (`bun run test:acceptance:e2e`): `1 failed, 40 passed`. The failure is order-notifications/bill-to-email.spec.ts [SWHR8-C-0108], outside this sprint; warning only, triaged at UAT.

E2E-RESULT: chromium 28 passed, 0 failed, 0 skipped
