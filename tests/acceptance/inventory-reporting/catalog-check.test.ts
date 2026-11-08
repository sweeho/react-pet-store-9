// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/jobs/catalog-check.ts exports
//   runCatalogCheck({ catalog, populate }): Promise<{ exitCode: number; log: string[] }>
// catalog is the catalog snapshot, or null when the catalog tables do not exist:
//   { categories: { id, locales }[], products: { id, categoryId }[],
//     items: { id, productId, listPrice, unitCost, descriptionLocales }[], inventoryItemIds: string[] }
// populate({ forcefully }) asks the storefront to load the catalog and resolves true on success.
const loadCheck = () => import("../../../server/jobs/catalog-check");

const healthyCatalog = () => ({
  categories: [{ id: "FISH", locales: ["en_US"] }],
  products: [{ id: "FI-SW-01", categoryId: "FISH" }],
  items: [
    {
      id: "EST-1",
      productId: "FI-SW-01",
      listPrice: 20,
      unitCost: 10,
      descriptionLocales: ["en_US"],
    },
  ],
  inventoryItemIds: ["EST-1"],
});

describe("catalog check", () => {
  // case: SWHR8-C-0143@v1
  it("[SWHR8-C-0143] logs a C3 line and exits 4 when list price is below unit cost", async () => {
    const { runCatalogCheck } = await loadCheck();
    const catalog = healthyCatalog();
    catalog.items[0].listPrice = 5;
    catalog.items[0].unitCost = 10;

    const result = await runCatalogCheck({ catalog, populate: async () => true });

    expect(result.log.some((line) => line.startsWith("C3 "))).toBe(true);
    expect(result.exitCode).toBe(4);
  });

  // case: SWHR8-C-0144@v1
  it("[SWHR8-C-0144] exits 8 when the catalog tables are missing and the populate request fails", async () => {
    const { runCatalogCheck } = await loadCheck();
    const requests: { forcefully: boolean }[] = [];

    const result = await runCatalogCheck({
      catalog: null,
      populate: async (req: { forcefully: boolean }) => {
        requests.push(req);
        return false;
      },
    });

    expect(requests).toEqual([{ forcefully: false }]);
    expect(result.exitCode).toBe(8);
  });
});
