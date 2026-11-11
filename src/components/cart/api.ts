import { useEffect, useState } from "react";

import { fetchSession, postJson } from "@/components/account/api";

export interface CartItemView {
  itemId: string;
  productId: string;
  categoryId: string;
  productName: string;
  attribute: string;
  quantity: number;
  listPrice: number;
  lineTotal: number;
}

export interface CartData {
  items: CartItemView[];
  total: number;
  count: number;
}

const CART_CHANGED = "cart:changed";
const notifyCartChanged = (): void => void window.dispatchEvent(new Event(CART_CHANGED));

export async function fetchCart(): Promise<CartData> {
  const res = await fetch("/api/cart");
  if (!res.ok) throw new Error("cart");
  return (await res.json()) as CartData;
}

export async function addToCart(itemId: string, quantity: number): Promise<boolean> {
  const res = await postJson("/api/cart/items", { itemId, quantity });
  if (res.ok) notifyCartChanged();
  return res.ok;
}

export async function updateCart(quantities: Record<string, string>): Promise<boolean> {
  const res = await postJson("/api/cart/update", { quantities });
  if (res.ok) notifyCartChanged();
  return res.ok;
}

export async function removeFromCart(itemId: string): Promise<boolean> {
  const res = await postJson("/api/cart/remove", { itemId });
  if (res.ok) notifyCartChanged();
  return res.ok;
}

/** The session's cart line count, reloaded when `key` (the path) changes or the cart changes. */
export function useCartCount(key: string): number {
  const [count, setCount] = useState(0);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(CART_CHANGED, bump);
    return () => window.removeEventListener(CART_CHANGED, bump);
  }, []);
  useEffect(() => {
    let cancelled = false;
    void fetchSession().then((s) => {
      if (!cancelled) setCount(s?.cartCount ?? 0);
    });
    return () => {
      cancelled = true;
    };
  }, [key, version]);
  return count;
}
