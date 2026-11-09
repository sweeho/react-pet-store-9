// Shared fixtures for the shopping-cart acceptance tests.
export type CatalogItem = {
  itemId: string;
  productId: string;
  categoryId: string;
  productName: string;
  attribute: string;
  listPrice: number;
};

export const item = (
  itemId: string,
  listPrice: number,
  over: Partial<CatalogItem> = {},
): CatalogItem => ({
  itemId,
  productId: "P-" + itemId,
  categoryId: "FISH",
  productName: "Product " + itemId,
  attribute: "Large",
  listPrice,
  ...over,
});

// A mutable in-memory catalog: find() looks the item up on every call (no snapshots).
export const makeCatalog = (items: CatalogItem[]) => {
  const map = new Map(items.map((i) => [i.itemId, i]));
  return {
    map,
    find: (itemId: string): CatalogItem | undefined => map.get(itemId),
  };
};
