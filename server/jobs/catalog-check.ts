// The catalog consistency check, C1 to C5 (design C6). Pure: it takes a plain
// snapshot of the catalog and returns the log and exit code. The CLI in
// scripts/catalog-check.ts reads SQLite into that shape.

import { EXIT_ERROR, EXIT_FOUND } from "./batch-types";

export interface CatalogSnapshot {
  categories: { id: string; locales: string[] }[];
  products: { id: string; categoryId: string }[];
  items: {
    id: string;
    productId: string;
    listPrice?: number;
    unitCost?: number;
    /** Prices per locale; when present, C3 checks each one instead of the top-level pair. */
    prices?: { locale: string; listPrice: number; unitCost: number }[];
    descriptionLocales: string[];
  }[];
  inventoryItemIds: string[];
}

export interface CatalogCheckInput {
  /** `null` when the catalog tables do not exist. */
  catalog: CatalogSnapshot | null;
  populate: (request: { forcefully: boolean }) => Promise<boolean>;
  /** Re-reads the catalog after a successful populate; when absent the check ends with 0. */
  reload?: () => CatalogSnapshot | null | Promise<CatalogSnapshot | null>;
}

export async function runCatalogCheck(
  input: CatalogCheckInput,
): Promise<{ exitCode: number; log: string[] }> {
  if (input.catalog) return checkCatalog(input.catalog);
  const loaded = await input.populate({ forcefully: false });
  if (!loaded) return { exitCode: EXIT_ERROR, log: ["Populate request failed"] };
  const reloaded = input.reload ? await input.reload() : null;
  if (!reloaded) return { exitCode: 0, log: [] };
  return checkCatalog(reloaded);
}

function checkCatalog(catalog: CatalogSnapshot): { exitCode: number; log: string[] } {
  const log: string[] = [];
  const { categories, products, items, inventoryItemIds } = catalog;
  const report = (code: string, id: string, message: string) => {
    log.push(`${code} ${id} ${message}`);
  };

  for (const c of categories) {
    if (!products.some((p) => p.categoryId === c.id)) report("C1", c.id, "category has no product");
  }
  for (const p of products) {
    if (!items.some((i) => i.productId === p.id)) report("C2", p.id, "product has no item");
  }
  const inventory = new Set(inventoryItemIds);
  for (const item of items) {
    const prices = item.prices ?? [
      { locale: "", listPrice: item.listPrice ?? 0, unitCost: item.unitCost ?? 0 },
    ];
    for (const price of prices.filter((p) => p.listPrice < p.unitCost)) {
      report(
        "C3",
        item.id,
        `list price ${price.listPrice} is below unit cost ${price.unitCost} ${price.locale}`.trim(),
      );
    }
    const product = products.find((p) => p.id === item.productId);
    const category = categories.find((c) => c.id === product?.categoryId);
    for (const locale of category?.locales ?? []) {
      if (!item.descriptionLocales.includes(locale)) {
        report("C4", item.id, `no description in ${locale}`);
      }
    }
    if (!inventory.has(item.id)) report("C5", item.id, "no supplier inventory row");
  }
  return { exitCode: log.length > 0 ? EXIT_FOUND : 0, log };
}
