// The catalog consistency check, C1 to C5 (design C6). Pure: it takes a plain
// snapshot of the catalog and returns the log and exit code. The CLI in
// scripts/catalog-check.ts reads SQLite into that shape.

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
}

/** Exit code bits; 8 is reserved for missing catalog tables (SWHR8-I-0013). */
const EXIT = { C1: 1, C2: 2, C3: 4, MISSING: 8, C4: 16, C5: 32 } as const;

export async function runCatalogCheck(
  input: CatalogCheckInput,
): Promise<{ exitCode: number; log: string[] }> {
  const log: string[] = [];
  if (!input.catalog) {
    const loaded = await input.populate({ forcefully: false });
    return { exitCode: loaded ? 0 : EXIT.MISSING, log };
  }
  const { categories, products, items, inventoryItemIds } = input.catalog;
  let exitCode = 0;
  const report = (code: keyof typeof EXIT, id: string, message: string) => {
    log.push(`${code} ${id} ${message}`);
    exitCode |= EXIT[code];
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
  return { exitCode, log };
}
