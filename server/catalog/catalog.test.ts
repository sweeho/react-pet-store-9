import { describe, expect, it } from "vitest";

import { CatalogError, createCatalog, paginate } from "./catalog";

type Row = Record<string, unknown>;
type Table = "category" | "product" | "item";

function makeSource(rows: Partial<Record<Table, Row[]>> = {}, failWith?: Error) {
  const calls: Table[] = [];
  return {
    calls,
    async select(table: Table, locale: string): Promise<Row[]> {
      calls.push(table);
      if (failWith) throw failWith;
      return (rows[table] ?? []).filter((r) => r.locale === locale);
    },
  };
}
const category = (id: string, name: string, locale = "en_US"): Row => ({ id, name, locale });
const product = (id: string, categoryId: string, name: string, locale = "en_US"): Row => ({
  id,
  categoryId,
  name,
  locale,
});
const item = (id: string, productId: string, description: string, locale = "en_US"): Row => ({
  id,
  productId,
  description,
  locale,
  listPrice: 10,
  unitCost: 5,
  image: `${id}.gif`,
});

describe("catalog queries", () => {
  it("[SWHR8-C-0232] an en_US shopper sees only en_US categories ordered by name", async () => {
    const source = makeSource({
      category: [
        category("REPTILES", "Reptiles"),
        category("BIRDS", "Birds"),
        category("FISH", "Fish"),
        category("FISH", "魚", "ja_JP"),
      ],
    });
    const list = await createCatalog({ source }).listCategories("en_US");
    expect(list.map((c) => c.name)).toEqual(["Birds", "Fish", "Reptiles"]);
  });

  it("[SWHR8-C-0237] listing for en_US returns only en_US entries by name", async () => {
    // The source ignores the locale here, so the catalog must filter again.
    const all = [
      category("DOGS", "Dogs"),
      category("CATS", "Cats"),
      category("CATS", "猫", "ja_JP"),
    ];
    const source = { select: async () => all };
    const list = await createCatalog({ source }).listCategories("en_US");
    expect(list.map((c) => c.name)).toEqual(["Cats", "Dogs"]);
    expect(list.every((c) => c.locale === "en_US")).toBe(true);
  });

  it("[SWHR8-C-0238] an unknown item id returns nothing and raises no error", async () => {
    const catalog = createCatalog({ source: makeSource({ item: [item("EST-1", "P1", "Fish")] }) });
    expect(await catalog.getItem("NO-SUCH-ITEM", "en_US")).toBeUndefined();
  });

  it("[SWHR8-C-0241] a database failure raises a catalog error with the message", async () => {
    const catalog = createCatalog({ source: makeSource({}, new Error("connection refused")) });
    const err = await catalog.listCategories("en_US").then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(CatalogError);
    expect((err as Error).message).toContain("connection refused");
  });

  it("lists products of one category and items of one product, 2 per page", async () => {
    const catalog = createCatalog({
      source: makeSource({
        product: [
          product("A", "FISH", "Alpha"),
          product("B", "FISH", "Beta"),
          product("C", "FISH", "Gamma"),
          product("D", "DOGS", "Delta"),
        ],
      }),
    });
    const page = await catalog.listProducts("FISH", "en_US", { start: 0 });
    expect(page.rows.map((p) => p.id)).toEqual(["A", "B"]);
    expect(page.hasNext).toBe(true);
    expect(page.hasPrevious).toBe(false);
    expect(await catalog.getProduct("D", "en_US")).toMatchObject({ name: "Delta" });
    expect(await catalog.getProduct("ZZ", "en_US")).toBeUndefined();
  });
});

describe("paging", () => {
  it("[SWHR8-C-0234] a start offset of -1 returns an empty page", () => {
    expect(paginate([1, 2, 3, 4, 5, 6], -1, 2).rows).toEqual([]);
  });

  it("[SWHR8-C-0239] the page at offset 2 of 6 rows, size 2, has next and previous", () => {
    const page = paginate(["a", "b", "c", "d", "e", "f"], 2, 2);
    expect(page.rows).toEqual(["c", "d"]);
    expect(page.hasNext).toBe(true);
    expect(page.hasPrevious).toBe(true);
  });

  it("an offset past the end returns an empty page", () => {
    expect(paginate([1, 2, 3], 3, 2)).toEqual({ rows: [], hasNext: false, hasPrevious: false });
  });
});

describe("search", () => {
  const rows = () => ({
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

  it("[SWHR8-C-0235] a whitespace-only query returns an empty page without a database query", async () => {
    const source = makeSource(rows());
    const page = await createCatalog({ source }).searchItems("   ", "en_US", {
      start: 0,
      count: 2,
    });
    expect(page.rows).toEqual([]);
    expect(source.calls).toEqual([]);
  });

  it("[SWHR8-C-0240] a two-word search returns items matching either word", async () => {
    const page = await createCatalog({ source: makeSource(rows()) }).searchItems(
      "angelfish lizard",
      "en_US",
      { start: 0, count: 10 },
    );
    expect(page.rows.map((r) => r.id).sort()).toEqual(["EST-1", "EST-3"]);
  });

  it("[SWHR8-C-0243] searching 'fish' matches a description containing 'Fish'", async () => {
    const source = makeSource({
      product: [product("P1", "BIRDS", "Parrot")],
      item: [item("EST-9", "P1", "Fish-eating bird: Fish lover")],
    });
    const page = await createCatalog({ source }).searchItems("fish", "en_US", {
      start: 0,
      count: 10,
    });
    expect(page.rows.map((r) => r.id)).toEqual(["EST-9"]);
  });

  it("matches the category identifier", async () => {
    const page = await createCatalog({ source: makeSource(rows()) }).searchItems("dogs", "en_US", {
      start: 0,
      count: 10,
    });
    expect(page.rows.map((r) => r.id)).toEqual(["EST-2"]);
  });
});
