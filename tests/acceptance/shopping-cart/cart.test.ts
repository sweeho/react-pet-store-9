// @vitest-environment node
import { describe, expect, it } from "vitest";
import { item, makeCatalog } from "./helpers";

// Assumed module boundary: server/cart/cart.ts exports
//   createCart() -> cart, a new empty per-session cart (one line per item id) with
//     cart.add(itemId, quantity?)           quantity defaults to 1; re-adding REPLACES the quantity
//     cart.remove(itemId)                   no-op when absent, never throws
//     cart.updateQuantity(itemId, quantity) > 0 sets, <= 0 removes
//     cart.empty()                          removes all lines
//     cart.count()                          number of distinct lines
//     cart.quantities()                     -> Record<itemId, quantity>
//   subtotal(cart, catalog) -> number       sum of catalog list price * quantity, no rounding
//     (catalog = { find(itemId, locale?) -> { listPrice, ... } | undefined })
const mod = () => import("../../../server/cart/cart");

describe("cart model", () => {
  // case: SWHR8-C-0066@v1
  it("[SWHR8-C-0066] subtotal of two lines is 25.50", async () => {
    const { createCart, subtotal } = await mod();
    const cart = createCart();
    cart.add("A", 2);
    cart.add("B", 1);
    const catalog = makeCatalog([item("A", 10.0), item("B", 5.5)]);
    expect(subtotal(cart, catalog)).toBe(25.5);
  });

  // case: SWHR8-C-0067@v1
  it("[SWHR8-C-0067] adding an item without a quantity holds it with quantity 1", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A");
    expect(cart.quantities()).toEqual({ A: 1 });
  });

  // case: SWHR8-C-0068@v1
  it("[SWHR8-C-0068] re-adding an existing item resets its quantity to 1", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A", 3);
    cart.add("A");
    expect(cart.quantities()).toEqual({ A: 1 });
    expect(cart.count()).toBe(1);
  });

  // case: SWHR8-C-0069@v1
  it("[SWHR8-C-0069] removing a present item drops it from the cart", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A", 2);
    cart.add("B", 1);
    cart.remove("A");
    expect(cart.quantities()).toEqual({ B: 1 });
  });

  // case: SWHR8-C-0070@v1
  it("[SWHR8-C-0070] removing an absent item leaves the cart unchanged and raises no error", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A", 2);
    expect(() => cart.remove("B")).not.toThrow();
    expect(cart.quantities()).toEqual({ A: 2 });
  });

  // case: SWHR8-C-0071@v1
  it("[SWHR8-C-0071] count reports distinct lines, not the sum of quantities", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A", 5);
    cart.add("B", 2);
    expect(cart.count()).toBe(2);
  });

  // case: SWHR8-C-0072@v1
  it("[SWHR8-C-0072] emptying the cart removes all lines", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A", 5);
    cart.add("B", 2);
    cart.empty();
    expect(cart.count()).toBe(0);
    expect(cart.quantities()).toEqual({});
  });

  // case: SWHR8-C-0079@v1
  it("[SWHR8-C-0079] updating a quantity to a positive value sets it", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A", 1);
    cart.updateQuantity("A", 4);
    expect(cart.quantities()).toEqual({ A: 4 });
  });

  // case: SWHR8-C-0080@v1
  it("[SWHR8-C-0080] updating a quantity to zero removes the item", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    cart.add("A", 2);
    cart.updateQuantity("A", 0);
    expect(cart.quantities()).toEqual({});
    expect(cart.count()).toBe(0);
  });

  // case: SWHR8-C-0081@v1
  it("[SWHR8-C-0081] a new session cart contains no lines", async () => {
    const { createCart } = await mod();
    const cart = createCart();
    expect(cart.count()).toBe(0);
    expect(cart.quantities()).toEqual({});
  });
});
