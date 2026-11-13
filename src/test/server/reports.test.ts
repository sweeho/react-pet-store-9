import { describe, expect, it } from "vitest";

import { orderQuantityReport, revenueReport } from "../../../server/lib/reports";

const orders = [
  { category: "FISH", itemId: "EST-1", amount: 10, quantity: 1, date: "2026-03-10" },
  { category: "FISH", itemId: "EST-2", amount: 20, quantity: 2, date: "2026-03-11" },
  { category: "DOGS", itemId: "EST-6", amount: 40, quantity: 1, date: "2026-03-31" },
  { category: "CATS", itemId: "EST-17", amount: 999, quantity: 9, date: "2026-04-30" },
];
const range = { start: "2026-03-01", end: "2026-03-31" };
const byKey = (r: { entries: { key: string; amount: number }[] }) =>
  Object.fromEntries(r.entries.map((e) => [e.key, e.amount]));

describe("reports", () => {
  it("[SWHR8-C-0152] without a category: one entry per category and a total", () => {
    const r = revenueReport({ orders, ...range });
    expect(byKey(r)).toEqual({ FISH: 30, DOGS: 40 });
    expect(r.total).toBe(70);
  });

  it("[SWHR8-C-0153] with a category: one entry per item and a total", () => {
    const r = revenueReport({ orders, ...range, category: "FISH" });
    expect(byKey(r)).toEqual({ "EST-1": 10, "EST-2": 20 });
    expect(r.total).toBe(30);
  });

  it("order quantity sums quantities", () => {
    const r = orderQuantityReport({ orders, ...range });
    expect(byKey(r)).toEqual({ FISH: 3, DOGS: 1 });
    expect(r.total).toBe(4);
  });
});
