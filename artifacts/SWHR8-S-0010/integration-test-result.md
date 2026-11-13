---
artifact: integration-test-result
sprint: SWHR8-S-0010
ticket: SWHR8-T-0044
author: validation
---

# Integration test result — SWHR8-S-0010

Command (after `bun install` and `bun run build`, both exit 0): `bun run test:e2e`
(`playwright test`, chromium project). Summary line verbatim: `28 passed (9.7s)`, exit 0, no skips reported.

| Spec                                                | Result |
| --------------------------------------------------- | ------ |
| e2e/smoke.spec.ts                                   | passed |
| e2e/home.spec.ts                                    | passed |
| e2e/localization.spec.ts                            | passed |
| e2e/checkout.spec.ts                                | passed |
| e2e/cart.spec.ts, catalog.spec.ts, account.spec.ts  | passed |
| e2e/admin-orders.spec.ts, admin-inventory\*.spec.ts | passed |

Locked acceptance browser tier (`bun run test:acceptance:e2e`): `1 failed, 40 passed (11.9s)`. All 4 admin-order-management specs
(SWHR8-C-0252, -0256, -0259, -0260) and the mixed/no-change commit cases passed. The one failure is
`order-notifications/bill-to-email.spec.ts` [SWHR8-C-0108] (POST returned HTML, not JSON), outside this sprint's capability; warning only, triaged at UAT.

E2E-RESULT: chromium 28 passed, 0 failed, 0 skipped
