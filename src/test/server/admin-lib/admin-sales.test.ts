// @vitest-environment node
import { describe, expect, it } from "vitest";

import { salesTotals } from "../../../../server/lib/admin-sales";

const lines = [
  { orderDate: "2026-03-10", category: "FISH", itemId: "EST-1", quantity: 2, unitPrice: 10 },
  { orderDate: "2026-03-11", category: "FISH", itemId: "EST-2", quantity: 1, unitPrice: 5 },
  { orderDate: "2026-03-12", category: "DOGS", itemId: "EST-6", quantity: 3, unitPrice: 20 },
  { orderDate: "2026-04-30", category: "DOGS", itemId: "EST-6", quantity: 9, unitPrice: 20 },
];
const range = { start: "2026-03-01", end: "2026-03-31" };
const asMap = (r: { key: string; total: number }[]) =>
  Object.fromEntries(r.map((e) => [e.key, e.total]));

describe("sales totals", () => {
  // case: SWHR8-C-0267@v1
  it("[SWHR8-C-0267] REVENUE sums quantity x unit price per category", () => {
    expect(asMap(salesTotals({ lines, type: "REVENUE", ...range }))).toEqual({
      FISH: 25,
      DOGS: 60,
    });
  });

  // case: SWHR8-C-0268@v1
  it("[SWHR8-C-0268] any other type sums quantity per item of the category", () => {
    expect(asMap(salesTotals({ lines, type: "QUANTITY", category: "FISH", ...range }))).toEqual({
      "EST-1": 2,
      "EST-2": 1,
    });
  });

  it("includes both range ends", () => {
    const r = salesTotals({ lines, type: "QUANTITY", start: "2026-03-12", end: "2026-04-30" });
    expect(asMap(r)).toEqual({ DOGS: 12 });
  });
});
