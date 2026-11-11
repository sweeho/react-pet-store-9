---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0005
capability brief: SWHR8-I-0006
branch: vortex/sprint/swhr8-s-0005-daaaa982
downstream: [artifacts/SWHR8-S-0005/qa-test-report.md]
---

# Integration test result — SWHR8-S-0005

## Commands run

```
bun install && bun run build        # exit 0
bun run test:e2e                    # exit 0 (chromium project)
```

## Results

`  22 passed (6.0s)`

| Spec                     | Result   | Notes                                |
| ------------------------ | -------- | ------------------------------------ |
| e2e/cart.spec.ts         | 6 passed | C-0074, 0075, 0076, 0078, 0083, 0047 |
| e2e/account.spec.ts      | 1 passed |                                      |
| e2e/catalog.spec.ts      | 2 passed |                                      |
| e2e/home.spec.ts         | 4 passed |                                      |
| e2e/localization.spec.ts | 6 passed |                                      |
| e2e/smoke.spec.ts        | 3 passed |                                      |

No spec file skipped; 0 skipped.

E2E-RESULT: chromium 22 passed, 0 failed, 0 skipped
