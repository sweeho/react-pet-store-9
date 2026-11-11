import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import locale from "../../../middleware/locale";
import cartGet from "../cart/index.get";
import itemsPost from "../cart/items.post";
import checkoutPost from "./index.post";
import queueGet from "./queue.get";

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
    let result: unknown;
    let status: number;
    try {
      result = await handler(event);
      status = event.res.status ?? 200;
    } catch (e) {
      const err = e as { status?: number; statusCode?: number; data?: unknown };
      status = err.status ?? err.statusCode ?? 500;
      result = err.data;
    }
    for (const c of event.res.headers.getSetCookie()) {
      const [k, v] = c.split("; ")[0].split("=");
      this.jar[k] = v;
    }
    return { status, body: (result ?? {}) as Record<string, unknown> };
  }
}

const party = (over: Record<string, string> = {}) => ({
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "Apt 2",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  phone: "555-0100",
  email: "jane@example.com",
  ...over,
});

const shopper = async (quantity = 2) => {
  const b = new Browser();
  await b.call(itemsPost, { itemId: "EST-1", quantity });
  return b;
};

describe("checkout routes", () => {
  it("[SWHR8-C-0181] submission queues the XML order, empties the cart, returns number and e-mail", async () => {
    const b = await shopper();
    const res = await b.call(checkoutPost, { billing: party(), shipping: party() });
    expect(res.status).toBe(200);
    expect(res.body.orderNumber).toBeTruthy();
    expect(res.body.email).toBe("jane@example.com");
    const queue = await b.call(queueGet);
    const messages = queue.body.messages as string[];
    expect(
      messages.some(
        (m) => m.trimStart().startsWith("<") && m.includes(String(res.body.orderNumber)),
      ),
    ).toBe(true);
    expect((await b.call(cartGet)).body.items).toHaveLength(0);
  });

  it("[SWHR8-C-0182] a blank shipping city blocks the order and is reported", async () => {
    const b = await shopper(1);
    const before = ((await b.call(queueGet)).body.messages as string[] | undefined)?.length ?? 0;
    const res = await b.call(checkoutPost, { billing: party(), shipping: party({ city: "" }) });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body.missing).toLowerCase()).toContain("city");
    expect((await b.call(queueGet)).body.messages).toHaveLength(before);
    expect((await b.call(cartGet)).body.items).toHaveLength(1);
  });

  it("[SWHR8-C-0183] a blank address line 2 and e-mail are accepted", async () => {
    const b = await shopper(1);
    const res = await b.call(checkoutPost, {
      billing: party({ address2: "", email: "" }),
      shipping: party({ address2: "", email: "" }),
    });
    expect(res.status).toBe(200);
    expect(res.body.orderNumber).toBeTruthy();
  });

  it("[SWHR8-C-0082] an empty cart is rejected with 409 and nothing is queued", async () => {
    const b = new Browser();
    const res = await b.call(checkoutPost, { billing: party(), shipping: party() });
    expect(res.status).toBe(409);
    expect(JSON.stringify(res.body)).toMatch(/EMPTY_CART/);
    expect((await b.call(queueGet)).body.messages).toHaveLength(0);
  });

  it("[SWHR8-C-0077] a second identical submit is rejected as an empty cart", async () => {
    const b = await shopper(1);
    expect((await b.call(checkoutPost, { billing: party(), shipping: party() })).status).toBe(200);
    expect((await b.call(checkoutPost, { billing: party(), shipping: party() })).status).toBe(409);
  });
});
