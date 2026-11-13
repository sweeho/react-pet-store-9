# TDD result — SWHR8-T-0042

## Notes

Platform-recorded runs (cases are linked to this ticket, so no `TDD-RESULT` marker is needed).

- Red run: `b52626dc-00f6-46cb-999c-71380ea385dd`, valid at commit 4d5a74d. All 23 linked cases fail on the stub sentinel (SWHR8-C-0249 on an assertion).
- Green run: recorded after the implementation commit (id in the ticket comment).

Own tests, by case:

- `src/test/server/admin-lib/admin-{orders,requests,launcher,session,sales}.test.ts`: SWHR8-C-0248..0251, 0253..0258, 0261..0264, 0267..0270.
- `src/pages/admin/{index,logout,orders}.test.tsx`: SWHR8-C-0252, 0256, 0259, 0260, 0265, 0266.
- Extra (no case): `routes/api/admin/admin-orders.test.ts` (401/403, listing, update-status, sales, launch, idle expiry), `e2e/admin-orders.spec.ts`.

Local gates: `bun run lint`, `bun run typecheck`, `bun run test` (77 files, 405 tests) pass; `bunx playwright test e2e/admin-orders.spec.ts` 2 passed; `bun run test:acceptance:e2e`: 40 passed, 1 failed (`order-notifications/bill-to-email.spec.ts`, SWHR8-C-0108, an endpoint of a later capability returning HTML; not this ticket); `bun run test:acceptance`: the 29 failures are all in other capabilities (inventory-reporting, order-reporting-batch), none in `admin-order-management/`.
