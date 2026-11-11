// Bridges the synchronous cart model to the async catalog (design K3).
import { catalog } from "../catalog";
import { createCart, listLines, type Cart, type CartLine, type CatalogLookup } from "./cart";

async function lookupFor(cart: Cart, locale: string): Promise<CatalogLookup> {
  const found = new Map<string, Omit<CartLine, "quantity">>();
  await Promise.all(
    Object.keys(cart.quantities()).map(async (itemId) => {
      try {
        const item = await catalog.getItem(itemId, locale);
        const product = item ? await catalog.getProduct(item.productId, locale) : undefined;
        if (item && product) {
          found.set(itemId, {
            itemId,
            productId: item.productId,
            categoryId: product.categoryId,
            productName: product.name,
            attribute: item.description,
            listPrice: item.listPrice,
          });
        }
      } catch {
        // A failed lookup omits the line (R-0226).
      }
    }),
  );
  return { find: (itemId) => found.get(itemId) };
}

export interface CartView {
  items: (CartLine & { lineTotal: number })[];
  total: number;
  count: number;
}

export async function cartView(cart: Cart, locale: string): Promise<CartView> {
  // One snapshot of the cart, so a concurrent add cannot make the lookup and the lines disagree.
  const snapshot = createCart();
  for (const [itemId, quantity] of Object.entries(cart.quantities()))
    snapshot.add(itemId, quantity);
  const lines = listLines(snapshot, await lookupFor(snapshot, locale), locale);
  const items = lines.map((l) => ({ ...l, lineTotal: l.listPrice * l.quantity }));
  return { items, total: items.reduce((s, l) => s + l.lineTotal, 0), count: snapshot.count() };
}
