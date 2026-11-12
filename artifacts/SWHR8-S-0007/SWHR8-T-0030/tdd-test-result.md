# TDD result — SWHR8-T-0030

## Notes

Platform-recorded runs (linked cases). Red run id: 6c4f280b-7b82-4c17-ab4a-b6e4efebab8f (commit 3fc297a). Green run: recorded by `a2a_run_tests(phase: "green")` after the implementation commit.
Red: 21 cases failed on the stub or an assertion; SWHR8-C-0092 and SWHR8-C-0095 already passed against the stubs (a stub throws, which satisfies "rejected"/"raises"); they are regression guards.
Own tests: `src/test/server/approval/service.test.ts` (the 23 case-keyed tests) and `queue.test.ts` (adapters, receipt-to-drain-to-APPROVED, rollback).
Full gate: `bun run verify` (lint, typecheck, unit): 53 files, 295 tests passed.
