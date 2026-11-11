import { createError, defineHandler, readBody } from "nitro/h3";

import { parseQuantity } from "../../../server/cart/cart";
import { cartFor } from "../../../server/cart/store";

// Applies every submitted quantity; a non-whole value counts as 0 and removes the line.
export default defineHandler(async (event) => {
  const body = ((await readBody(event)) ?? {}) as { quantities?: Record<string, unknown> };
  const cart = cartFor(event.context.sessionId as string);
  const q = body.quantities;
  if (q !== undefined && (q === null || typeof q !== "object" || Array.isArray(q))) {
    throw createError({ statusCode: 400, statusMessage: "quantities must be an object" });
  }
  for (const [itemId, raw] of Object.entries(q ?? {})) {
    cart.updateQuantity(itemId, parseQuantity(raw));
  }
  return { count: cart.count() };
});
