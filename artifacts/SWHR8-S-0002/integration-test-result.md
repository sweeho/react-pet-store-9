---
artifact: integration-test-result
sprint: SWHR8-S-0002
ticket: SWHR8-T-0009
author: validation
commit: 332037f
---

# Integration test result

Command: `bun run build` then `bun run test:e2e -- --project=chromium`

Summary: `13 passed (4.3s)`

| Spec                     | Tests                                    | Result |
| ------------------------ | ---------------------------------------- | ------ |
| e2e/home.spec.ts         | 4                                        | pass   |
| e2e/localization.spec.ts | 6 (C-0010, 0011, 0012, 0022, 0023, 0024) | pass   |
| e2e/smoke.spec.ts        | 3                                        | pass   |

No spec file was wholly skipped.

E2E-RESULT: chromium 13 passed, 0 failed, 0 skipped
