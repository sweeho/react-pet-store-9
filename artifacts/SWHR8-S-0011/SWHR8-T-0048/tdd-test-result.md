# TDD result — SWHR8-T-0048

## Notes

Platform-recorded runs (cases SWHR8-C-0118 … C-0135):

- Red run: `12b37fc6-dbb7-4f64-ab4d-0644970b4a0b` at 910c291 — every case failed on the stub.
- Green run: `540b9993-59a7-4458-bbd9-c337bd4273ae` at ff81805 — every case passed; locked acceptance run `be7c4845-494d-4850-a9a4-5c17da1d39fc` passed for all 18 cases.

Tests: `routes/jobs/*.test.ts` (unit tests of the pure modules plus `order-batch-store.test.ts` against the in-memory db). They live under `routes/` because only that path is a test glob and runs in the node project.

Full gate at HEAD: `bun run lint` 0, `bun run typecheck` 0, `bun run test` 83 files / 426 tests passed (before the last type re-export; `routes/jobs` re-run 21 passed).
