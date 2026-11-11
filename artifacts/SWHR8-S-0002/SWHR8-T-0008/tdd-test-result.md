# TDD result — SWHR8-T-0008

Linked cases carry platform-recorded runs; the merge gate replays the `[tdd:red]` and `[tdd:green]` commits.

## Notes

- Red run id: `93405f3d-e6f2-41a7-9070-e637ed7e8bb8` (all 24 linked cases failed on the VortexNotImplemented stubs).
- Green run id: recorded by `a2a_run_tests(phase: "green")` after the green commit (see ticket comment).
- Unit tests live under `routes/localization/` because the project's `testEvidence.testGlobs` only cover `src/`, `routes/` and `e2e/`; a `server/**/*.test.ts` file was classed as production code by the red check.
- Full gate on the green commit: `bun run lint` 0, `bun run typecheck` 0, `bun run test` 23 files / 96 tests passed, `bun run build` 0, `bun run test:e2e` 13 passed.
- Locked suites `tests/acceptance/localization/localization.test.ts` and `tests/acceptance/site-shell` pass (24 tests).
