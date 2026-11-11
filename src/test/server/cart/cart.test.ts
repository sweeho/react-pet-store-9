// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createCart, listLines, parseQuantity, subtotal } from "../../../../server/cart/cart";

const item = (itemId: string, listPrice: number) => ({
  itemId,
  productId: "P-" + itemId,
  categoryId: "FISH",
  productName: "Product " + itemId,
  attribute: "Large",
  listPrice,
});
const makeCatalog = (items: ReturnType<typeof item>[]) => {
  const map = new Map(items.map((i) => [i.itemId, i]));
  return { map, find: (id: string) => map.get(id) };
};

describe("cart model", () => {
  it("[SWHR8-C-0066] subtotal of two lines is 25.50", () => {
    const cart = createCart();
    cart.add("A", 2);
    cart.add("B", 1);
    expect(subtotal(cart, makeCatalog([item("A", 10), item("B", 5.5)]))).toBe(25.5);
  });
  it("[SWHR8-C-0067] add without quantity defaults to 1", () => {
    const cart = createCart();
    cart.add("A");
    expect(cart.quantities()).toEqual({ A: 1 });
  });
  it("[SWHR8-C-0068] re-adding resets quantity to 1", () => {
    const cart = createCart();
    cart.add("A", 3);
    cart.add("A");
    expect(cart.quantities()).toEqual({ A: 1 });
    expect(cart.count()).toBe(1);
  });
  it("[SWHR8-C-0069] removes a present item", () => {
    const cart = createCart();
    cart.add("A", 2);
    cart.add("B", 1);
    cart.remove("A");
    expect(cart.quantities()).toEqual({ B: 1 });
  });
  it("[SWHR8-C-0070] removing an absent item is a no-op", () => {
    const cart = createCart();
    cart.add("A", 2);
    expect(() => cart.remove("B")).not.toThrow();
    expect(cart.quantities()).toEqual({ A: 2 });
  });
  it("[SWHR8-C-0071] count reports distinct lines", () => {
    const cart = createCart();
    cart.add("A", 5);
    cart.add("B", 2);
    expect(cart.count()).toBe(2);
  });
  it("[SWHR8-C-0072] emptying removes all lines", () => {
    const cart = createCart();
    cart.add("A", 5);
    cart.empty();
    expect(cart.count()).toBe(0);
    expect(cart.quantities()).toEqual({});
  });
  it("[SWHR8-C-0079] update to a positive value sets it", () => {
    const cart = createCart();
    cart.add("A", 1);
    cart.updateQuantity("A", 4);
    expect(cart.quantities()).toEqual({ A: 4 });
  });
  it("[SWHR8-C-0080] update to zero removes the item", () => {
    const cart = createCart();
    cart.add("A", 2);
    cart.updateQuantity("A", 0);
    expect(cart.quantities()).toEqual({});
  });
  it("[SWHR8-C-0081] a new cart is empty", () => {
    const cart = createCart();
    expect(cart.count()).toBe(0);
    expect(cart.quantities()).toEqual({});
  });
  it("[SWHR8-C-0074] a text quantity parses to 0 and removes the item", () => {
    expect(parseQuantity("abc")).toBe(0);
    expect(parseQuantity("2.5")).toBe(0);
    expect(parseQuantity("")).toBe(0);
    expect(parseQuantity(" 3 ")).toBe(3);
    const cart = createCart();
    cart.add("A", 2);
    cart.updateQuantity("A", parseQuantity("abc"));
    expect(cart.count()).toBe(0);
  });
});

describe("cart lines", () => {
  it("[SWHR8-C-0073] a line shows the changed catalog price", () => {
    const cart = createCart();
    cart.add("A", 2);
    const catalog = makeCatalog([item("A", 10)]);
    expect(listLines(cart, catalog)[0].listPrice).toBe(10);
    catalog.map.set("A", item("A", 12.25));
    expect(listLines(cart, catalog)[0].listPrice).toBe(12.25);
  });
  it("[SWHR8-C-0084] a line for a missing item is omitted silently", () => {
    const cart = createCart();
    cart.add("A", 1);
    cart.add("GONE", 3);
    const catalog = makeCatalog([item("A", 10)]);
    expect(listLines(cart, catalog).map((l) => l.itemId)).toEqual(["A"]);
    expect(subtotal(cart, catalog)).toBe(10);
  });
});
