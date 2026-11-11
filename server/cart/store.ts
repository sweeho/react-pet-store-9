// In-memory carts keyed by session id (design K2). Nothing is persisted.
import { createCart, type Cart } from "./cart";

export function createCartStore() {
  const carts = new Map<string, Cart>();
  return {
    cartFor(sessionId: string): Cart {
      let cart = carts.get(sessionId);
      if (!cart) carts.set(sessionId, (cart = createCart()));
      return cart;
    },
    dropCart: (sessionId: string): void => void carts.delete(sessionId),
  };
}

const shared = createCartStore();
export const cartFor = shared.cartFor;
export const dropCart = shared.dropCart;
