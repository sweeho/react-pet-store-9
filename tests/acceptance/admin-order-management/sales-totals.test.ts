// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/lib/admin-sales.ts exports
//   salesTotals({ lines, type, start, end, category? }): { key: string; total: number }[]
// lines: { orderDate (ISO yyyy-mm-dd), category, itemId, quantity, unitPrice }[]
// type "REVENUE": per-category sum of quantity * unitPrice; any other type: per-item quantity sums
// (per category, or per item of `category` when given).
const load = () => import("../../../server/lib/admin-sales");

const lines = [
  { orderDate: "2026-03-10", category: "FISH", itemId: "EST-1", quantity: 2, unitPrice: 10 },
  { orderDate: "2026-03-11", category: "FISH", itemId: "EST-2", quantity: 1, unitPrice: 5 },
  { orderDate: "2026-03-12", category: "DOGS", itemId: "EST-6", quantity: 3, unitPrice: 20 },
  { orderDate: "2026-04-30", category: "DOGS", itemId: "EST-6", quantity: 9, unitPrice: 20 },
];
const range = { start: "2026-03-01", end: "2026-03-31" };
const asMap = (r: { key: string; total: number }[]) =>
  Object.fromEntries(r.map((e) => [e.key, e.total]));

describe("admin sales totals", () => {
  // case: SWHR8-C-0267@v1
  it("[SWHR8-C-0267] REVENUE returns per-category sums of quantity times unit price", async () => {
    const { salesTotals } = await load();

    const result = salesTotals({ lines, type: "REVENUE", ...range });

    expect(asMap(result)).toEqual({ FISH: 25, DOGS: 60 });
  });

  // case: SWHR8-C-0268@v1
  it("[SWHR8-C-0268] a request other than REVENUE returns per-item quantity totals", async () => {
    const { salesTotals } = await load();

    const result = salesTotals({ lines, type: "QUANTITY", category: "FISH", ...range });

    expect(asMap(result)).toEqual({ "EST-1": 2, "EST-2": 1 });
  });
});
