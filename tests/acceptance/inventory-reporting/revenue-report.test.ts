// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/lib/reports.ts exports
//   revenueReport({ orders, start, end, category? }): { entries: { key: string; amount: number }[]; total: number }
// orders: { category, itemId, amount, quantity, date (ISO yyyy-mm-dd) }[]
// Without category, entries are per category; with a category, entries are per item of that category.
const loadReports = () => import("../../../server/lib/reports");

const orders = [
  { category: "FISH", itemId: "EST-1", amount: 10, quantity: 1, date: "2026-03-10" },
  { category: "FISH", itemId: "EST-2", amount: 20, quantity: 2, date: "2026-03-11" },
  { category: "DOGS", itemId: "EST-6", amount: 40, quantity: 1, date: "2026-03-12" },
  { category: "CATS", itemId: "EST-16", amount: 80, quantity: 4, date: "2026-03-13" },
  { category: "CATS", itemId: "EST-17", amount: 999, quantity: 9, date: "2026-04-30" }, // out of range
];
const range = { start: "2026-03-01", end: "2026-03-31" };

describe("admin revenue report", () => {
  // case: SWHR8-C-0152@v1
  it("[SWHR8-C-0152] without a category returns one entry per category and a grand total", async () => {
    const { revenueReport } = await loadReports();

    const report = revenueReport({ orders, ...range });

    expect(
      Object.fromEntries(
        report.entries.map((e: { key: string; amount: number }) => [e.key, e.amount]),
      ),
    ).toEqual({
      FISH: 30,
      DOGS: 40,
      CATS: 80,
    });
    expect(report.total).toBe(150);
  });

  // case: SWHR8-C-0153@v1
  it("[SWHR8-C-0153] with a category returns one entry per item of that category and a grand total", async () => {
    const { revenueReport } = await loadReports();

    const report = revenueReport({ orders, ...range, category: "FISH" });

    expect(
      Object.fromEntries(
        report.entries.map((e: { key: string; amount: number }) => [e.key, e.amount]),
      ),
    ).toEqual({
      "EST-1": 10,
      "EST-2": 20,
    });
    expect(report.total).toBe(30);
  });
});
