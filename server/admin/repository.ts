// Administrator roles and the inventory listing (change swhr8-i-0010, design F7, F8).
import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/client";
import { inventory, item, itemDetails, product, productDetails, userRole } from "../../db/schema";

export const ADMINISTRATOR_ROLE = "administrator";

export const hasRole = (userName: string, role: string): boolean =>
  db
    .select()
    .from(userRole)
    .where(and(eq(userRole.userName, userName), eq(userRole.role, role)))
    .get() !== undefined;

export interface InventoryItem {
  itemId: string;
  description: string;
  productId: string;
  productName: string;
  quantity: number;
}

const LOCALE = "en_US";
const natural = new Intl.Collator("en", { numeric: true });

/** Every inventory row once, with the catalog's English description when the item is in the catalog. */
export function listInventoryItems(): InventoryItem[] {
  const rows = db
    .select({
      itemId: inventory.itemId,
      quantity: inventory.quantity,
      description: itemDetails.description,
      productId: item.productId,
      productName: productDetails.name,
    })
    .from(inventory)
    .leftJoin(item, eq(item.id, inventory.itemId))
    .leftJoin(itemDetails, and(eq(itemDetails.itemId, item.id), eq(itemDetails.locale, LOCALE)))
    .leftJoin(product, eq(product.id, item.productId))
    .leftJoin(
      productDetails,
      and(eq(productDetails.productId, product.id), eq(productDetails.locale, LOCALE)),
    )
    .orderBy(asc(inventory.itemId))
    .all();
  return rows
    .map((r) => ({
      itemId: r.itemId,
      description: r.description ?? r.itemId,
      productId: r.productId ?? "",
      productName: r.productName ?? "",
      quantity: r.quantity,
    }))
    .sort((a, b) => natural.compare(a.itemId, b.itemId));
}
