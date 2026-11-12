# TDD result — SWHR8-T-0034

## Notes

Platform-recorded runs. Red run id: 566569b9-10c3-447f-9713-1d5d67223632 (commit 353affe). Green run is recorded by `a2a_run_tests(phase: "green")` on the implementation commit.
Red: 8 cases failed on the stub. SWHR8-C-0108 (bill-to e-mail already stored by existing code) and SWHR8-C-0109 (a throwing stub rejects) already passed: regression guards.
Own tests: `src/test/server/notifications/{mailer,order-mail,bill-to,queue}.test.ts`. SWHR8-C-0108's e2e locked test is disputed (design SD1).
Full gate: `bun run verify`: 57 files, 311 tests passed.
