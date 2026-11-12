import { defineHandler, readBody } from "nitro/h3";

import { cartView } from "../../../server/cart/lines";
import { cartFor } from "../../../server/cart/store";
import { CheckoutError, placeOrder } from "../../../server/checkout/service";
import { orderQueue } from "../../../server/checkout/queue";
import type { Contact } from "../../../server/checkout/model";

// Sessions with an order in flight: a concurrent second submit must not place the same cart twice.
const inFlight = new Set<string>();

const party = (v: unknown): Partial<Contact> =>
  v && typeof v === "object" ? (v as Partial<Contact>) : {};

// Places the session cart as an order. Open to every session (design S2); a signed-on shopper's
// user name is stamped on the order. The cart is emptied only after the hand-off succeeded.
export default defineHandler(async (event) => {
  const body = ((await readBody(event).catch(() => undefined)) ?? {}) as Record<string, unknown>;
  const sessionId = event.context.sessionId as string;
  const locale = event.context.locale as string;
  const cart = cartFor(sessionId);
  if (inFlight.has(sessionId)) {
    event.res.status = 409;
    return { error: "EMPTY_CART" };
  }
  inFlight.add(sessionId);
  try {
    const view = await cartView(cart, locale);
    const order = await placeOrder({
      userId: (event.context.userName as string | undefined) ?? null,
      locale,
      cart: view.items.map((i) => ({
        categoryId: i.categoryId,
        productId: i.productId,
        itemId: i.itemId,
        quantity: i.quantity,
        unitCost: i.listPrice,
      })),
      billing: party(body.billing),
      shipping: party(body.shipping),
      queue: orderQueue(sessionId),
    });
    cart.empty();
    return { orderNumber: Number(order.orderId), email: order.email };
  } catch (e) {
    if (e instanceof CheckoutError) {
      event.res.status = e.code === "EMPTY_CART" ? 409 : 400;
      return e.code === "EMPTY_CART" ? { error: e.code } : { missing: e.missing };
    }
    throw e;
  } finally {
    inFlight.delete(sessionId);
  }
});
