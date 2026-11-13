// @vitest-environment node
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runInventoryReport } from "../../../server/jobs/inventory-report";
import { yyyymmdd } from "../../../server/jobs/batch-types";

const now = new Date(2026, 2, 20, 1, 50);
const item = (itemId: string, quantity: number, description = `Desc ${itemId}`) => ({
  itemId,
  productId: `P-${itemId}`,
  description,
  quantity,
});

async function run(items: ReturnType<typeof item>[], lowStockQty?: number) {
  const outDir = path.join(await mkdtemp(path.join(tmpdir(), "inv-")), "nested");
  const result = await runInventoryReport({ items, outDir, now, lowStockQty });
  return { ...result, text: await readFile(result.file, "utf8") };
}

describe("inventory report", () => {
  it("[SWHR8-C-0142] lists only the low-stock item, then items tracked and total units", async () => {
    const { text, file } = await run([item("EST-1", 12), item("EST-2", 700)]);
    expect(path.basename(file)).toBe(`inventory_${yyyymmdd(now)}.txt`);
    expect(text).toContain("EST-1");
    expect(text).not.toContain("EST-2");
    expect(text).toContain("ITEMS TRACKED 2");
    expect(text).toContain("TOTAL UNITS 712");
  });

  it("[SWHR8-C-0151] with threshold 500 lists only items under 500 units", async () => {
    const { text } = await run([item("BELOW", 499), item("AT", 500), item("ABOVE", 501)], 500);
    expect(text).toContain("BELOW");
    expect(text).not.toMatch(/\bAT\b/);
    expect(text).not.toContain("ABOVE");
  });

  it("lists 12 then 499 in order, excluding 500 (R-0069.01)", async () => {
    const { text } = await run([item("C", 500), item("B", 499), item("A", 12)]);
    expect(text.indexOf("A ")).toBeLessThan(text.indexOf("B "));
    expect(text).not.toContain("Desc C");
    expect(text).toContain("ITEMS TRACKED 3");
    expect(text).toContain("TOTAL UNITS 1011");
  });

  it("omits an item with no English description but still counts it (R-0069.02)", async () => {
    const { text } = await run([item("NODESC", 3, ""), item("OK", 4)]);
    expect(text).not.toContain("NODESC");
    expect(text).toContain("OK");
    expect(text).toContain("ITEMS TRACKED 2");
    expect(text).toContain("TOTAL UNITS 7");
  });

  it("resolves exit code 8 when the file cannot be written", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "inv-"));
    const blocker = path.join(dir, "file");
    await (await import("node:fs/promises")).writeFile(blocker, "x");
    const result = await runInventoryReport({
      items: [item("A", 1)],
      outDir: path.join(blocker, "sub"),
      now,
    });
    expect(result.exitCode).toBe(8);
  });
});
