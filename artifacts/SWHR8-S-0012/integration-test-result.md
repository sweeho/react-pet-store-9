---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0012
---

# Integration test result — SWHR8-S-0012

Command: `bun run test:e2e` (Playwright, chromium project, served on :5178). Run on sprint branch head 30087a1 after `bun install` and `bun run build`.

Run summary (verbatim): `28 passed (9.4s)`

| Spec                               | Passed | Failed | Skipped |
| ---------------------------------- | ------ | ------ | ------- |
| e2e/account.spec.ts                | 1      | 0      | 0       |
| e2e/admin-inventory-update.spec.ts | 1      | 0      | 0       |
| e2e/admin-inventory.spec.ts        | 1      | 0      | 0       |
| e2e/admin-orders.spec.ts           | 2      | 0      | 0       |
| e2e/cart.spec.ts                   | 6      | 0      | 0       |
| e2e/catalog.spec.ts                | 2      | 0      | 0       |
| e2e/checkout.spec.ts               | 2      | 0      | 0       |
| e2e/home.spec.ts                   | 4      | 0      | 0       |
| e2e/localization.spec.ts           | 6      | 0      | 0       |
| e2e/smoke.spec.ts                  | 3      | 0      | 0       |

No spec file ran zero tests. This sprint's capability has no UI, so no E2E spec targets it directly; it is covered by the acceptance suite (229 passed).

E2E-RESULT: chromium 28 passed, 0 failed, 0 skipped
