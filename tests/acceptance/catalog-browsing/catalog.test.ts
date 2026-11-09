// @vitest-environment node
import { describe, expect, it } from "vitest";
import { category, item, makeSource, product } from "./helpers";

// Assumed module boundary: server/catalog/catalog.ts exports
//   createCatalog({ source }) with source.select(table: "category"|"product"|"item", locale): Promise<Row[]>
//     (rows already limited to the locale; the catalog must not rely on that, it filters again)
//     catalog.listCategories(locale)                 -> Promise<Category[]> ordered by name
//     catalog.getItem(id, locale)                    -> Promise<Item | undefined>, never throws for unknown id
//     catalog.searchItems(query, locale, { start, count }) -> Promise<Page<Item>>
//   paginate(rows, start, count)                     -> { rows, hasNext, hasPrevious }
//   CatalogError                                     -> Error subclass raised on data-access failure
// A Page is { rows: T[], hasNext: boolean, hasPrevious: boolean }.
const mod = () => import("../../../server/catalog/catalog");

// Assumed module boundary: server/catalog/store.ts exports
//   createCatalogStore() with addProduct({ id, categoryId }) and
//   addItemLocale({ itemId, locale, listPrice, unitCost, image, description }); both throw on a missing mandatory field
//   and addProduct throws when categoryId does not name a stored category (addCategory({ id }) stores one).
const storeMod = () => import("../../../server/catalog/store");

// Assumed: server/jobs/catalog-check.ts exports runCatalogCheck({ catalog, populate }) -> { exitCode, log }
// (same contract the inventory-reporting acceptance tests use).
const checkMod = () => import("../../../server/jobs/catalog-check");

describe("catalog queries", () => {
  // case: SWHR8-C-0232@v1
  it("[SWHR8-C-0232] an en_US shopper sees only en_US categories ordered by name", async () => {
    const { createCatalog } = await mod();
    const source = makeSource({
      category: [
        category("REPTILES", "Reptiles"),
        category("BIRDS", "Birds"),
        category("FISH", "Fish"),
        category("FISH", "魚", "ja_JP"),
      ],
    });
    const list = await createCatalog({ source }).listCategories("en_US");
    expect(list.map((c: { name: string }) => c.name)).toEqual(["Birds", "Fish", "Reptiles"]);
  });

  // case: SWHR8-C-0237@v1
  it("[SWHR8-C-0237] listing categories for en_US returns only en_US entries by name", async () => {
    const { createCatalog } = await mod();
    const source = makeSource({
      category: [
        category("DOGS", "Dogs"),
        category("CATS", "Cats"),
        category("CATS", "猫", "ja_JP"),
        category("DOGS", "犬", "ja_JP"),
      ],
    });
    const list = await createCatalog({ source }).listCategories("en_US");
    expect(list.map((c: { name: string }) => c.name)).toEqual(["Cats", "Dogs"]);
    expect(list.every((c: { locale: string }) => c.locale === "en_US")).toBe(true);
  });

  // case: SWHR8-C-0238@v1
  it("[SWHR8-C-0238] looking up an unknown item id returns nothing and raises no error", async () => {
    const { createCatalog } = await mod();
    const catalog = createCatalog({ source: makeSource({ item: [item("EST-1", "P1", "Fish")] }) });
    const found = await catalog.getItem("NO-SUCH-ITEM", "en_US");
    expect(found).toBeUndefined();
  });

  // case: SWHR8-C-0241@v1
  it("[SWHR8-C-0241] a database failure raises a catalog error carrying the underlying message", async () => {
    const { createCatalog, CatalogError } = await mod();
    const catalog = createCatalog({ source: makeSource({}, new Error("connection refused")) });
    const err = await catalog.listCategories("en_US").then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(CatalogError);
    expect((err as Error).message).toContain("connection refused");
  });
});

describe("paging", () => {
  // case: SWHR8-C-0234@v1
  it("[SWHR8-C-0234] a start offset of -1 returns an empty page", async () => {
    const { paginate } = await mod();
    const page = paginate([1, 2, 3, 4, 5, 6], -1, 2);
    expect(page.rows).toEqual([]);
  });

  // case: SWHR8-C-0239@v1
  it("[SWHR8-C-0239] the page at offset 2 of 6 rows with size 2 has 2 rows, next and previous", async () => {
    const { paginate } = await mod();
    const page = paginate(["a", "b", "c", "d", "e", "f"], 2, 2);
    expect(page.rows).toEqual(["c", "d"]);
    expect(page.hasNext).toBe(true);
    expect(page.hasPrevious).toBe(true);
  });
});

describe("search", () => {
  const rows = () => ({
    category: [category("FISH", "Fish"), category("DOGS", "Dogs")],
    product: [
      product("FI-SW-01", "FISH", "Angelfish"),
      product("K9-BD-01", "DOGS", "Bulldog"),
      product("RP-LI-02", "REPTILES", "Iguana"),
    ],
    item: [
      item("EST-1", "FI-SW-01", "Large angelfish"),
      item("EST-2", "K9-BD-01", "Friendly dog"),
      item("EST-3", "RP-LI-02", "Green lizard"),
    ],
  });

  // case: SWHR8-C-0235@v1
  it("[SWHR8-C-0235] a whitespace-only query returns an empty page and does not query the database", async () => {
    const { createCatalog } = await mod();
    const source = makeSource(rows());
    const page = await createCatalog({ source }).searchItems("   ", "en_US", {
      start: 0,
      count: 2,
    });
    expect(page.rows).toEqual([]);
    expect(source.calls).toEqual([]);
  });

  // case: SWHR8-C-0240@v1
  it("[SWHR8-C-0240] a two-word search returns items matching either word", async () => {
    const { createCatalog } = await mod();
    const page = await createCatalog({ source: makeSource(rows()) }).searchItems(
      "angelfish lizard",
      "en_US",
      { start: 0, count: 10 },
    );
    const ids = page.rows.map((r: { id: string }) => r.id).sort();
    expect(ids).toEqual(["EST-1", "EST-3"]);
  });

  // case: SWHR8-C-0243@v1
  it("[SWHR8-C-0243] searching 'fish' matches an item whose description contains 'Fish'", async () => {
    const { createCatalog } = await mod();
    const source = makeSource({
      product: [product("P1", "BIRDS", "Parrot")],
      item: [item("EST-9", "P1", "Fish-eating bird: Fish lover")],
    });
    const page = await createCatalog({ source }).searchItems("fish", "en_US", {
      start: 0,
      count: 10,
    });
    expect(page.rows.map((r: { id: string }) => r.id)).toEqual(["EST-9"]);
  });
});

describe("catalog structure", () => {
  // case: SWHR8-C-0236@v1
  it("[SWHR8-C-0236] a product with no category is rejected by the store", async () => {
    const { createCatalogStore } = await storeMod();
    const store = createCatalogStore();
    expect(() => store.addProduct({ id: "P-ORPHAN", categoryId: undefined })).toThrow();
  });

  // case: SWHR8-C-0246@v1
  it("[SWHR8-C-0246] an item locale record without a list price is rejected by the store", async () => {
    const { createCatalogStore } = await storeMod();
    const store = createCatalogStore();
    expect(() =>
      store.addItemLocale({
        itemId: "EST-1",
        locale: "en_US",
        listPrice: undefined,
        unitCost: 12,
        image: "a.gif",
        description: "Fish",
      }),
    ).toThrow();
  });

  // case: SWHR8-C-0245@v1
  it("[SWHR8-C-0245] a product with no item is reported under C2 and the check exits non-zero", async () => {
    const { runCatalogCheck } = await checkMod();
    const catalog = {
      categories: [{ id: "FISH", locales: ["en_US"] }],
      products: [{ id: "FI-SW-01", categoryId: "FISH" }],
      items: [],
      inventoryItemIds: [],
    };
    const result = await runCatalogCheck({ catalog, populate: async () => true });
    expect(result.log.some((l: string) => l.startsWith("C2 ") && l.includes("FI-SW-01"))).toBe(
      true,
    );
    expect(result.exitCode).not.toBe(0);
  });
});
