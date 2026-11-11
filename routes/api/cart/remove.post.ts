import { defineHandler, readBody } from "nitro/h3";

import { cartFor } from "../../../server/cart/store";

// Removes a line; an absent item is ignored.
export default defineHandler(async (event) => {
  const body = ((await readBody(event)) ?? {}) as { itemId?: unknown };
  const cart = cartFor(event.context.sessionId as string);
  if (typeof body.itemId === "string") cart.remove(body.itemId);
  return { count: cart.count() };
});
