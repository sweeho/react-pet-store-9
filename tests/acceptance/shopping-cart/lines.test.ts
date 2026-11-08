// @vitest-environment node
import { describe, expect, it } from "vitest";
import { item, makeCatalog } from "./helpers";

// Assumed module boundary: server/cart/cart.ts (see cart.test.ts) plus
//   listLines(cart, catalog, locale = "en_US") -> Array<{ itemId, productId, categoryId, productName,
//     attribute, quantity, listPrice }>   resolved from the catalog on every call (no price snapshot);
//     a line whose catalog lookup returns undefined is omitted, silently (no throw, no message).
//   subtotal(cart, catalog) omits such a line's cost too.
// server/checkout/service.ts: placeOrder({ ..., cart: [] }) as in the order-checkout tests.
const mod = () => import("../../../server/cart/cart");

describe("cart lines", () => {
  // case: SWHR8-C-0073@v1
  it("[SWHR8-C-0073] a cart line shows the changed catalog price", async () => {
    const { createCart, listLines } = await mod();
    const cart = createCart();
    cart.add("A", 2);
    const catalog = makeCatalog([item("A", 10)]);
    expect(listLines(cart, catalog)[0].listPrice).toBe(10);
    catalog.map.set("A", item("A", 12.25));
    const lines = listLines(cart, catalog);
    expect(lines).toHaveLength(1);
    expect(lines[0].listPrice).toBe(12.25);
    expect(lines[0].quantity).toBe(2);
  });

  // case: SWHR8-C-0084@v1
  it("[SWHR8-C-0084] a cart line for an item missing from the catalog is omitted without a message", async () => {
    const { createCart, listLines, subtotal } = await mod();
    const cart = createCart();
    cart.add("A", 1);
    cart.add("GONE", 3);
    const catalog = makeCatalog([item("A", 10)]);
    let lines: Awaited<ReturnType<typeof listLines>> = [];
    expect(() => {
      lines = listLines(cart, catalog);
    }).not.toThrow();
    expect(lines.map((l) => l.itemId)).toEqual(["A"]);
    expect(subtotal(cart, catalog)).toBe(10);
  });
});

describe("order submit with an empty cart", () => {
  // case: SWHR8-C-0082@v1
  it("[SWHR8-C-0082] submitting an order with an empty cart is rejected and creates no order", async () => {
    const { placeOrder } = await import("../../../server/checkout/service");
    const c = {
      lastName: "Doe",
      firstName: "Jane",
      address1: "1 Main St",
      address2: "",
      city: "Springfield",
      state: "CA",
      postalCode: "94000",
      phone: "555-0100",
      email: "jane@example.com",
    };
    const delivered: string[] = [];
    await expect(
      placeOrder({
        userId: "alice",
        locale: "en_US",
        cart: [],
        billing: c,
        shipping: c,
        queue: { deliver: (t: string) => delivered.push(t) },
      }),
    ).rejects.toThrow(/empty/i);
    expect(delivered).toHaveLength(0);
  });
});
