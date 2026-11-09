// @vitest-environment node
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/jobs/inventory-report.ts exports
//   runInventoryReport({ items, outDir, now, lowStockQty? }): Promise<{ file: string }>
// items: { itemId, productId, description, quantity }[]; the file is inventory_YYYYMMDD.txt in outDir.
// lowStockQty is the low-stock configuration value (default 500).
const loadReport = () => import("../../../server/jobs/inventory-report");

const now = new Date("2026-03-20T01:50:00Z");
const item = (itemId: string, quantity: number) => ({
  itemId,
  productId: `P-${itemId}`,
  description: `Desc ${itemId}`,
  quantity,
});

async function run(items: ReturnType<typeof item>[], lowStockQty?: number): Promise<string> {
  const { runInventoryReport } = await loadReport();
  const outDir = await mkdtemp(path.join(tmpdir(), "inv-"));
  const { file } = await runInventoryReport({ items, outDir, now, lowStockQty });
  expect(path.basename(file)).toBe("inventory_20260320.txt");
  return readFile(file, "utf8");
}

describe("inventory extract", () => {
  // case: SWHR8-C-0142@v1
  it("[SWHR8-C-0142] lists only the low-stock item, then items-tracked count and total units", async () => {
    const text = await run([item("EST-1", 12), item("EST-2", 700)]);

    expect(text).toContain("EST-1");
    expect(text).not.toContain("EST-2");
    const afterList = text.slice(text.indexOf("EST-1"));
    expect(afterList).toMatch(/\b2\b/); // items tracked
    expect(afterList).toMatch(/\b712\b/); // total units in stock
  });

  // case: SWHR8-C-0151@v1
  it("[SWHR8-C-0151] with threshold 500 lists only items under 500 units", async () => {
    const text = await run([item("BELOW", 499), item("AT", 500), item("ABOVE", 501)], 500);

    expect(text).toContain("BELOW");
    expect(text).not.toContain("AT-");
    expect(text).not.toMatch(/\bAT\b/);
    expect(text).not.toContain("ABOVE");
  });
});
