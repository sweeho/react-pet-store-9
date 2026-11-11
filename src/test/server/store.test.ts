import { describe, expect, it } from "vitest";

import { createCatalogStore } from "../../../server/catalog/store";

describe("catalog store structure", () => {
  it("[SWHR8-C-0236] a product with no category is rejected", () => {
    const store = createCatalogStore();
    expect(() => store.addProduct({ id: "P-ORPHAN", categoryId: undefined })).toThrow();
    expect(() => store.addProduct({ id: "P-X", categoryId: "NOPE" })).toThrow();
    store.addCategory({ id: "FISH" });
    expect(() => store.addProduct({ id: "P-OK", categoryId: "FISH" })).not.toThrow();
  });

  it("[SWHR8-C-0246] an item locale record without a list price is rejected", () => {
    const store = createCatalogStore();
    const record = {
      itemId: "EST-1",
      locale: "en_US",
      listPrice: 16.5,
      unitCost: 12,
      image: "a.gif",
      description: "Fish",
    };
    expect(() => store.addItemLocale({ ...record, listPrice: undefined })).toThrow();
    expect(() => store.addItemLocale({ ...record, image: undefined })).toThrow();
    expect(() => store.addItemLocale(record)).not.toThrow();
  });
});
