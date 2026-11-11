---
artifact: tdd-test-result
sprint: SWHR8-S-0006
ticket: SWHR8-T-0026
---

# TDD result

## Test cases

Linked cases SWHR8-C-0077, 0082, 0154 to 0187. Tests carry the case key in their titles:
`src/test/server/checkout/{model,placement,storage}.test.ts`, `routes/api/checkout/checkout.test.ts`, `routes/api/account/profile.test.ts`, `src/pages/checkout/{index,confirmation}.test.tsx`, `src/pages/order/index.test.tsx`, `e2e/checkout.spec.ts`.

## Red run

Platform red run `7849abdf-0d09-4abd-b131-4a0237238d6c` at commit 82f2b0e: valid, every case failed on an assertion or the `VortexNotImplemented` stub.

## Green run

Platform green run `b9dd5cad-8310-4557-86ff-5383da62b31d` at 5eafc22: valid, all cases pass, and the locked acceptance tests passed (run `07b4f11e-2860-4c73-ab34-e809297e8dae`). A later commit applied code-review fixes and a second green run was recorded.

## Notes

Full gate after the review fixes: `bun run lint`, `bun run typecheck`, `bun run test` all green. `bun run test:e2e`: 24 passed, twice. `[SWHR8-C-0022]` in `e2e/localization.spec.ts` raced the option load under the added load; a one-line wait now fixes it.
