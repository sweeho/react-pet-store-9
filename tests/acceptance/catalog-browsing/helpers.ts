// Shared fixtures for the catalog-browsing acceptance tests.
export type Row = Record<string, unknown>;
export type Table = "category" | "product" | "item";

export interface CatalogRows {
  category: Row[];
  product: Row[];
  item: Row[];
}

// A data source over in-memory rows. `calls` records every read so a test can
// observe whether the database was queried; `failWith` makes every read reject.
export function makeSource(rows: Partial<CatalogRows> = {}, failWith?: Error) {
  const calls: { table: Table; locale: string }[] = [];
  const data: CatalogRows = { category: [], product: [], item: [], ...rows };
  return {
    calls,
    async select(table: Table, locale: string): Promise<Row[]> {
      calls.push({ table, locale });
      if (failWith) throw failWith;
      return data[table].filter((r) => r.locale === locale);
    },
  };
}

export const category = (id: string, name: string, locale = "en_US"): Row => ({ id, name, locale });
export const product = (id: string, categoryId: string, name: string, locale = "en_US"): Row => ({
  id,
  categoryId,
  name,
  locale,
});
export const item = (
  id: string,
  productId: string,
  description: string,
  locale = "en_US",
  listPrice = 10,
  unitCost = 5,
): Row => ({ id, productId, description, locale, listPrice, unitCost, image: `${id}.gif` });
