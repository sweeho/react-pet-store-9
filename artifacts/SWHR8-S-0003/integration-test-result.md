---
sprint: SWHR8-S-0003
ticket: SWHR8-T-0013
author: validation
---

# Integration test result — SWHR8-S-0003

Command: `bun install && bun run build && bun run test:e2e` (playwright.config.ts, chromium project; exit 0)

Summary line: `15 passed (5.0s)`

| Spec                     | Tests | Result |
| ------------------------ | ----- | ------ |
| e2e/catalog.spec.ts      | 2     | pass   |
| e2e/home.spec.ts         | 4     | pass   |
| e2e/localization.spec.ts | 6     | pass   |
| e2e/smoke.spec.ts        | 3     | pass   |

No skips, no failures; every spec file ran its tests.

E2E-RESULT: chromium 15 passed, 0 failed, 0 skipped
