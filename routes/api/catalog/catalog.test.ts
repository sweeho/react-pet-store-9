import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import categories from "./categories.get";
import category from "./category/[id].get";
import item from "./item/[id].get";
import product from "./product/[id].get";
import search from "./search.get";

type Handler = (event: H3Event) => unknown;

function call(
  handler: Handler,
  path: string,
  params: Record<string, string> = {},
  locale = "en_US",
) {
  const event = new H3Event(new Request(`http://localhost${path}`));
  event.context.locale = locale;
  event.context.params = params;
  return Promise.resolve(handler(event));
}

const names = (page: unknown) => (page as { rows: { name: string }[] }).rows.map((r) => r.name);

describe("catalog API (seeded legacy catalog)", () => {
  it("[SWHR8-C-0232] lists en_US categories ordered by name", async () => {
    expect(names(await call(categories, "/api/catalog/categories?count=50"))).toEqual([
      "Birds",
      "Cats",
      "Dogs",
      "Fish",
      "Reptiles",
    ]);
  });

  it("pages categories two at a time", async () => {
    const page = (await call(categories, "/api/catalog/categories")) as {
      rows: unknown[];
      hasNext: boolean;
    };
    expect(page.rows).toHaveLength(2);
    expect(page.hasNext).toBe(true);
  });

  it("lists categories in the session locale only", async () => {
    expect(
      names(await call(categories, "/api/catalog/categories?count=50", {}, "ja_JP")),
    ).toHaveLength(5);
    expect(names(await call(categories, "/api/catalog/categories?count=50", {}, "de_DE"))).toEqual(
      [],
    );
  });

  it("pages the products of a category two at a time", async () => {
    const first = (await call(category, "/api/catalog/category/FISH", { id: "FISH" })) as {
      products: { rows: unknown[]; hasNext: boolean; hasPrevious: boolean };
    };
    expect(first.products.rows).toHaveLength(2);
    expect(first.products).toMatchObject({ hasNext: true, hasPrevious: false });
    const out = (await call(category, "/api/catalog/category/FISH?start=99", { id: "FISH" })) as {
      products: { rows: unknown[] };
    };
    expect(out.products.rows).toEqual([]);
  });

  it("responds 404 for an unknown category, product and item", async () => {
    await expect(call(category, "/x", { id: "NOPE" })).rejects.toMatchObject({ status: 404 });
    await expect(call(product, "/x", { id: "NOPE" })).rejects.toMatchObject({ status: 404 });
    await expect(call(item, "/x", { id: "NOPE" })).rejects.toMatchObject({ status: 404 });
  });

  it("lists the items of a product and returns an item with raw prices", async () => {
    const items = (await call(product, "/api/catalog/product/FI-SW-01", { id: "FI-SW-01" })) as {
      items: { rows: { id: string }[] };
    };
    expect(items.items.rows.length).toBeGreaterThan(0);
    const found = await call(item, "/api/catalog/item/EST-1", { id: "EST-1" });
    expect(found).toMatchObject({ id: "EST-1", listPrice: 16.5, productName: "Angelfish" });
  });

  it("[SWHR8-C-0243] search is case-insensitive and matches any word", async () => {
    const result = (await call(search, "/api/catalog/search?q=ANGELFISH%20zzz&count=50")) as {
      rows: { productName: string }[];
    };
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.every((r) => r.productName === "Angelfish")).toBe(true);
  });

  it("[SWHR8-C-0235] a blank search returns an empty page", async () => {
    expect(await call(search, "/api/catalog/search?q=%20%20")).toEqual({
      rows: [],
      hasNext: false,
      hasPrevious: false,
    });
  });
});
