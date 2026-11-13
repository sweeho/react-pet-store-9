---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0009
ticket: SWHR8-T-0039
capability_brief: SWHR8-I-0010
branch: vortex/test/SWHR8-T-0039-integration-qa-report-swhr8-s-0009-73c8ff4d
---

# Integration test result

Command: `bun run test:e2e -- --project=chromium` (after `bun install` and `bun run build`, both exit 0)

Summary line: `26 passed (9.0s)`, 0 failed, 0 skipped.

| Spec file                          | Tests | Result |
| ---------------------------------- | ----- | ------ |
| e2e/account.spec.ts                | 1     | pass   |
| e2e/admin-inventory-update.spec.ts | 1     | pass   |
| e2e/admin-inventory.spec.ts        | 1     | pass   |
| e2e/cart.spec.ts                   | 6     | pass   |
| e2e/catalog.spec.ts                | 2     | pass   |
| e2e/checkout.spec.ts               | 2     | pass   |
| e2e/home.spec.ts                   | 4     | pass   |
| e2e/localization.spec.ts           | 6     | pass   |
| e2e/smoke.spec.ts                  | 3     | pass   |

Counts are from per-file result lines in the run log; no spec file was wholly skipped.

E2E-RESULT: chromium 26 passed, 0 failed, 0 skipped
