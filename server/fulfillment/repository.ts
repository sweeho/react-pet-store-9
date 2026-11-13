// Supplier-side persistence (change swhr8-i-0010, design F4-F6). The purchase-order cascade lives in
// the checkout repository, the only module that touches order tables.
import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/client";
import { contacts, inventory, supplierLineItems, supplierOrders } from "../../db/schema";
import type { Db } from "../checkout/repository";
import type { SupplierOrder } from "./service";

export {
  createPurchaseOrderWithDependents,
  deletePurchaseOrder,
  findPurchaseOrderDependents,
} from "../checkout/repository";

type StoredLine = SupplierOrder["lines"][number];

interface SaveInput {
  id: number;
  userId?: string;
  orderDate: Date;
  status: string;
  contact: NonNullable<SupplierOrder["contact"]>;
  lines: (Omit<StoredLine, "shipped"> & { shipped?: number })[];
}

export function insertSupplierOrder(d: Db, order: SaveInput): void {
  const c = order.contact;
  const contactId = d
    .insert(contacts)
    .values({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      address1: c.address1 ?? c.street,
      city: c.city,
      state: c.state,
      postalCode: c.postalCode ?? c.zipCode,
      country: c.country,
    })
    .returning({ id: contacts.id })
    .get().id;
  d.insert(supplierOrders)
    .values({
      id: order.id,
      userId: order.userId,
      orderDate: order.orderDate,
      status: order.status,
      contactId,
    })
    .run();
  if (order.lines.length) {
    d.insert(supplierLineItems)
      .values(
        order.lines.map((l) => ({
          supplierOrderId: order.id,
          lineNumber: l.lineNumber,
          category: l.category,
          product: l.product,
          item: l.item,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          shipped: l.shipped ?? 0,
        })),
      )
      .run();
  }
}

/** Writes back the mutable state of an existing supplier order: status and shipped quantities. */
export function updateSupplierOrder(d: Db, order: SupplierOrder): void {
  d.update(supplierOrders)
    .set({ status: order.status })
    .where(eq(supplierOrders.id, order.id))
    .run();
  for (const l of order.lines) {
    d.update(supplierLineItems)
      .set({ shipped: l.shipped })
      .where(
        and(
          eq(supplierLineItems.supplierOrderId, order.id),
          eq(supplierLineItems.lineNumber, l.lineNumber),
        ),
      )
      .run();
  }
}

export function loadSupplierOrder(d: Db, id: number): SupplierOrder | undefined {
  const row = d.select().from(supplierOrders).where(eq(supplierOrders.id, id)).get();
  return row ? hydrate(d, row) : undefined;
}

function hydrate(d: Db, row: typeof supplierOrders.$inferSelect): SupplierOrder {
  const contact = d.select().from(contacts).where(eq(contacts.id, row.contactId)).get();
  const lines = d
    .select()
    .from(supplierLineItems)
    .where(eq(supplierLineItems.supplierOrderId, row.id))
    .orderBy(asc(supplierLineItems.lineNumber))
    .all();
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    orderDate: row.orderDate,
    status: row.status as SupplierOrder["status"],
    contact: contact && {
      firstName: contact.firstName ?? undefined,
      lastName: contact.lastName ?? undefined,
      email: contact.email ?? undefined,
      phone: contact.phone ?? undefined,
      address1: contact.address1 ?? undefined,
      street: contact.address1 ?? undefined,
      city: contact.city ?? undefined,
      state: contact.state ?? undefined,
      postalCode: contact.postalCode ?? undefined,
      zipCode: contact.postalCode ?? undefined,
      country: contact.country ?? undefined,
    },
    lines: lines.map((l) => ({
      category: l.category,
      product: l.product,
      item: l.item,
      lineNumber: l.lineNumber,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      shipped: l.shipped,
    })),
  };
}

export const loadSupplierOrdersByStatus = (d: Db, status: string): SupplierOrder[] =>
  d
    .select()
    .from(supplierOrders)
    .where(eq(supplierOrders.status, status))
    .orderBy(asc(supplierOrders.id))
    .all()
    .map((row) => hydrate(d, row));

export const loadInventory = (d: Db): Record<string, number> =>
  Object.fromEntries(
    d
      .select()
      .from(inventory)
      .all()
      .map((r) => [r.itemId, r.quantity]),
  );

export function writeInventory(d: Db, itemId: string, quantity: number): void {
  d.insert(inventory)
    .values({ itemId, quantity })
    .onConflictDoUpdate({ target: inventory.itemId, set: { quantity } })
    .run();
}

/** Supplier orders as (order id, status); the supplier order id is the purchase-order number. */
export const listSupplierOrderStatuses = (d: Db): { orderId: string; status: string }[] =>
  d
    .select({ id: supplierOrders.id, status: supplierOrders.status })
    .from(supplierOrders)
    .all()
    .map((r) => ({ orderId: String(r.id), status: r.status }));

/** Deletes a supplier order, its lines and its contact inside the caller's transaction. */
export function deleteSupplierOrderRows(d: Db, id: number): void {
  const row = d.select().from(supplierOrders).where(eq(supplierOrders.id, id)).get();
  if (!row) return;
  d.delete(supplierLineItems).where(eq(supplierLineItems.supplierOrderId, id)).run();
  d.delete(supplierOrders).where(eq(supplierOrders.id, id)).run();
  d.delete(contacts).where(eq(contacts.id, row.contactId)).run();
}

export async function saveSupplierOrder(order: SaveInput): Promise<void> {
  db.transaction((tx) => insertSupplierOrder(tx, order));
}

export async function getSupplierOrder(id: number): Promise<SupplierOrder | undefined> {
  return loadSupplierOrder(db, id);
}

export async function findSupplierOrdersByStatus(
  status: string,
): Promise<{ id: number; status: string }[]> {
  return db
    .select({ id: supplierOrders.id, status: supplierOrders.status })
    .from(supplierOrders)
    .where(eq(supplierOrders.status, status))
    .all();
}

export async function listInventory(): Promise<{ itemId: string; quantity: number }[]> {
  return db.select().from(inventory).orderBy(asc(inventory.itemId)).all();
}
