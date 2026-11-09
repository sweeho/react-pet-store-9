# TDD result — SWHR8-T-0002

## Notes

Platform-recorded runs (linked cases SWHR8-C-0136 to C-0140):

- Red: run `10491a08-c1ef-4fc9-844b-2726a8dd526a`, valid. Every case failed on an assertion or the stub.
- Green: run `1a67a532-117a-4b5e-9401-22a9b822b90d`. All five cases pass, but the verdict is `unofficial`: the plan-mandated one-line change to `vite.config.ts` (exclude `**/_layout.tsx` from `Pages()`) counts as a runner configuration change and needs a person's approval.

Full gate at HEAD: `bun run verify` (lint, typecheck, unit) 14 files / 34 tests passed; `bun run build` ok; `bun run test:e2e` 7 passed. Locked `tests/acceptance/site-shell/landing-and-navigation.spec.ts` (C-0136, C-0137) run directly against the dev server: 2 passed. Locked `shell-layout.test.tsx` and `state-frames.test.tsx` (C-0138 to C-0140) pass in the unit run.
