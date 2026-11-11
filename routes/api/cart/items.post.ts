import { createError, defineHandler, readBody } from "nitro/h3";

import { cartFor } from "../../../server/cart/store";

// Adds an item (quantity defaults to 1; re-adding replaces it).
export default defineHandler(async (event) => {
  const body = ((await readBody(event)) ?? {}) as { itemId?: unknown; quantity?: unknown };
  const itemId = typeof body.itemId === "string" ? body.itemId : "";
  if (!itemId) throw createError({ statusCode: 400, statusMessage: "itemId is required" });
  const quantity = body.quantity === undefined ? undefined : Number(body.quantity);
  cartFor(event.context.sessionId as string).add(itemId, quantity);
  return { count: cartFor(event.context.sessionId as string).count() };
});
