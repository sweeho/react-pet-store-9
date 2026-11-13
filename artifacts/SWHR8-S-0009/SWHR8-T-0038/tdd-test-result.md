---
ticket: SWHR8-T-0038
sprint: SWHR8-S-0009
artifact: tdd-test-result
---

# TDD result — SWHR8-T-0038

Linked test cases have platform-recorded runs; the merge gate replays the `[tdd:red]` and `[tdd:green]` commits.

## Notes

- Red run id `7cb65aab-1917-4a81-9bec-54cad7b7f95f` (commit e981442): 44 cases, stub or assertion failures.
- Green run id `1b6c8012-ff78-442f-bf96-5491e29a44d3` (commit f835afb), re-recorded after the review fixes (see the ticket comment): all cases pass, locked acceptance tests pass.
- Local gate: `bun run verify:full` (lint, typecheck, unit, e2e) — results in the ticket comment.
