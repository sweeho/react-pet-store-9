# TDD result — SWHR8-T-0012

Recorded by the platform (linked test cases), so no `TDD-RESULT` marker.

## Test cases

Linked cases SWHR8-C-0019, 0020, 0232, 0234–0247 (see ticket). Tests carry the case key in their titles: `src/test/server/{catalog,store,catalog-check}.test.ts`, `src/pages/{category/[id],item/[id],search}.test.tsx`, `routes/api/catalog/catalog.test.ts`.

## Red run

Run `dce38591-122a-45f8-842c-d716ccfde38f` at `625ba30`: valid. Every case failed on the sentinel stub except SWHR8-C-0019 and SWHR8-C-0020, which already passed (earlier localization tests) and are listed as already passing.

## Green run

Run `7e3083dc-d4e6-4624-8fde-4f5f081b84e6` at `94f33d3`: valid, all linked cases pass, locked acceptance unit/integration cases pass. A later commit re-run is recorded in the ticket comment.

## Notes

Full local gate: `bun run verify` pass (145 tests); `bun run test:e2e` 15 passed.
