import { describe, expect, it } from "vitest";

import { runCatalogCheck } from "../catalog-check";

const ok = async () => true;
const item = (over: Record<string, unknown> = {}) => ({
  id: "EST-1",
  productId: "FI-SW-01",
  listPrice: 20,
  unitCost: 10,
  descriptionLocales: ["en_US"],
  ...over,
});
const clean = () => ({
  categories: [{ id: "FISH", locales: ["en_US"] }],
  products: [{ id: "FI-SW-01", categoryId: "FISH" }],
  items: [item()],
  inventoryItemIds: ["EST-1"],
});

describe("catalog consistency check", () => {
  it("[SWHR8-C-0245] a product with no item is reported under C2 and the check exits non-zero", async () => {
    const catalog = { ...clean(), items: [], inventoryItemIds: [] };
    const result = await runCatalogCheck({ catalog, populate: ok });
    expect(result.log.some((l) => l.startsWith("C2 ") && l.includes("FI-SW-01"))).toBe(true);
    expect(result.exitCode).not.toBe(0);
  });

  it("a consistent catalog exits zero with no findings", async () => {
    const result = await runCatalogCheck({ catalog: clean(), populate: ok });
    expect(result.exitCode).toBe(0);
    expect(result.log.filter((l) => /^C[1-5] /.test(l))).toEqual([]);
  });

  it("reports C1 (category without product), C3 (price below cost), C4 (no description), C5 (no inventory)", async () => {
    const catalog = {
      categories: [
        { id: "FISH", locales: ["en_US"] },
        { id: "EMPTY", locales: ["en_US"] },
      ],
      products: [
        { id: "FI-SW-01", categoryId: "FISH" },
        { id: "ORPHAN", categoryId: "GONE" },
      ],
      items: [item({ descriptionLocales: [], listPrice: 5 })],
      inventoryItemIds: [],
    };
    const { log, exitCode } = await runCatalogCheck({ catalog, populate: ok });
    expect(exitCode).not.toBe(0);
    expect(log).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^C1 EMPTY/),
        expect.stringMatching(/^C3 EST-1/),
        expect.stringMatching(/^C4 EST-1/),
        expect.stringMatching(/^C5 EST-1/),
      ]),
    );
  });

  it("a C3 finding alone exits 4", async () => {
    const catalog = { ...clean(), items: [item({ listPrice: 5 })] };
    expect((await runCatalogCheck({ catalog, populate: ok })).exitCode).toBe(4);
  });
});
