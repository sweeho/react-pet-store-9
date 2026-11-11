// The per-session cart model (design K1, K5): item id -> quantity, no prices stored.

export interface CartLine {
  itemId: string;
  productId: string;
  categoryId: string;
  productName: string;
  attribute: string;
  quantity: number;
  listPrice: number;
}

/** A synchronous catalog lookup; `undefined` means the item cannot be resolved. */
export interface CatalogLookup {
  find(itemId: string, locale?: string): Omit<CartLine, "quantity"> | undefined;
}

export interface Cart {
  add(itemId: string, quantity?: number): void;
  remove(itemId: string): void;
  updateQuantity(itemId: string, quantity: number): void;
  empty(): void;
  count(): number;
  quantities(): Record<string, number>;
}

export function createCart(): Cart {
  const lines = new Map<string, number>();
  return {
    add: (itemId, quantity = 1) => void lines.set(itemId, quantity),
    remove: (itemId) => void lines.delete(itemId),
    updateQuantity(itemId, quantity) {
      if (quantity > 0) lines.set(itemId, quantity);
      else lines.delete(itemId);
    },
    empty: () => lines.clear(),
    count: () => lines.size,
    quantities: () => Object.fromEntries(lines),
  };
}

/** A whole number (optional sign, surrounding spaces) as an integer; anything else is 0. */
export function parseQuantity(raw: unknown): number {
  if (typeof raw === "number") return Number.isInteger(raw) ? raw : 0;
  if (typeof raw !== "string" || !/^\s*[+-]?\d+\s*$/.test(raw)) return 0;
  return Number.parseInt(raw, 10);
}

/** The lines whose items resolve in the catalog, read fresh on every call; others are omitted. */
export function listLines(cart: Cart, catalog: CatalogLookup, locale = "en_US"): CartLine[] {
  const lines: CartLine[] = [];
  for (const [itemId, quantity] of Object.entries(cart.quantities())) {
    const found = catalog.find(itemId, locale);
    if (found) lines.push({ ...found, itemId, quantity });
  }
  return lines;
}

/** Sum of list price times quantity over the resolvable lines, unrounded. */
export function subtotal(cart: Cart, catalog: CatalogLookup): number {
  return listLines(cart, catalog).reduce((sum, l) => sum + l.listPrice * l.quantity, 0);
}
