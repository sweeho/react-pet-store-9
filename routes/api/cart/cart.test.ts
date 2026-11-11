import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import locale from "../../../middleware/locale";
import cartGet from "./index.get";
import itemsPost from "./items.post";
import removePost from "./remove.post";
import updatePost from "./update.post";
import session from "../session.get";
import signoff from "../signoff.post";

class Browser {
  jar: Record<string, string> = {};
  async call(handler: (e: H3Event) => unknown, body?: unknown) {
    const headers = new Headers();
    const cookie = Object.entries(this.jar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
    if (cookie) headers.set("cookie", cookie);
    if (body !== undefined) headers.set("content-type", "application/json");
    const event = new H3Event(
      new Request("http://localhost/api/x", {
        method: body === undefined ? "GET" : "POST",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
    await locale(event);
    const result = await handler(event);
    for (const c of event.res.headers.getSetCookie()) {
      const [k, v] = c.split("; ")[0].split("=");
      this.jar[k] = v;
    }
    return result as Record<string, unknown>;
  }
}

describe("cart routes", () => {
  it("[SWHR8-C-0078] an anonymous shopper can add and read back an item", async () => {
    const b = new Browser();
    await b.call(itemsPost, { itemId: "EST-1" });
    const cart = (await b.call(cartGet)) as { items: { itemId: string; quantity: number }[] };
    expect(cart.items).toMatchObject([{ itemId: "EST-1", quantity: 1 }]);
  });
  it("[SWHR8-C-0083] update applies several quantities at once", async () => {
    const b = new Browser();
    await b.call(itemsPost, { itemId: "EST-1" });
    await b.call(itemsPost, { itemId: "EST-6" });
    await b.call(updatePost, { quantities: { "EST-1": "3", "EST-6": 5 } });
    const cart = (await b.call(cartGet)) as { items: { itemId: string; quantity: number }[] };
    expect(Object.fromEntries(cart.items.map((i) => [i.itemId, i.quantity]))).toEqual({
      "EST-1": 3,
      "EST-6": 5,
    });
  });
  it("[SWHR8-C-0074] a text quantity removes the item", async () => {
    const b = new Browser();
    await b.call(itemsPost, { itemId: "EST-1", quantity: 2 });
    await b.call(updatePost, { quantities: { "EST-1": "abc" } });
    const cart = (await b.call(cartGet)) as { items: unknown[] };
    expect(cart.items).toHaveLength(0);
  });
  it("[SWHR8-C-0073] the cart reads the catalog price and a US-dollar-ready total", async () => {
    const b = new Browser();
    await b.call(itemsPost, { itemId: "EST-1", quantity: 2 });
    await b.call(itemsPost, { itemId: "EST-6" });
    const cart = (await b.call(cartGet)) as {
      items: { listPrice: number; quantity: number }[];
      total: number;
      count: number;
    };
    expect(cart.count).toBe(2);
    expect(cart.total).toBeCloseTo(cart.items.reduce((s, i) => s + i.listPrice * i.quantity, 0));
  });
  it("[SWHR8-C-0084] an item missing from the catalog is omitted without an error", async () => {
    const b = new Browser();
    await b.call(itemsPost, { itemId: "NOPE-1" });
    await b.call(itemsPost, { itemId: "EST-1" });
    const cart = (await b.call(cartGet)) as { items: { itemId: string }[] };
    expect(cart.items.map((i) => i.itemId)).toEqual(["EST-1"]);
  });
  it("[SWHR8-C-0069] remove drops a line; [SWHR8-C-0070] an absent line is ignored", async () => {
    const b = new Browser();
    await b.call(itemsPost, { itemId: "EST-1" });
    await b.call(removePost, { itemId: "EST-6" });
    await b.call(removePost, { itemId: "EST-1" });
    expect(((await b.call(cartGet)) as { items: unknown[] }).items).toHaveLength(0);
  });
  it("[SWHR8-C-0047] sign-off clears the cart count", async () => {
    const b = new Browser();
    await b.call(itemsPost, { itemId: "EST-1", quantity: 2 });
    expect((await b.call(session)).cartCount).toBe(1);
    await b.call(signoff);
    expect((await b.call(session)).cartCount).toBe(0);
  });
});
