---
artifact: integration-test-result
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0004
capability brief: SWHR8-I-0005
branch: vortex/sprint/swhr8-s-0004-17e72ca0
downstream: [artifacts/SWHR8-S-0004/qa-test-report.md]
---

# Integration test result — SWHR8-S-0004

## Commands run

```
bun install && bun run build        # exit 0
bun run test:e2e                    # exit 0 (playwright test; only project: chromium, 16 tests listed)
```

## Results

`  16 passed (5.4s)`

| Spec                     | Result   | Notes                                                   |
| ------------------------ | -------- | ------------------------------------------------------- |
| e2e/account.spec.ts      | 1 passed | SWHR8-C-0056 register, customer form, sign off, sign on |
| e2e/catalog.spec.ts      | 2 passed |                                                         |
| e2e/home.spec.ts         | 4 passed |                                                         |
| e2e/localization.spec.ts | 6 passed |                                                         |
| e2e/smoke.spec.ts        | 3 passed |                                                         |

No spec file was skipped; 0 skipped.

E2E-RESULT: chromium 16 passed, 0 failed, 0 skipped
