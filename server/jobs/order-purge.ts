// The weekly purge of finished orders and their personal data (design B6).
import { EXIT_OK, type BatchOrder } from "./batch-types";

export interface PurgeOrder extends BatchOrder {
  contactId?: string;
  addressId?: string;
  cardId?: string;
}

export interface PurgeStore {
  orders: PurgeOrder[];
  orderLines: { orderId: string }[];
  orderManager: { orderId: string }[];
  supplierOrders: { id: string; orderId: string; status: string }[];
  supplierLineItems: { supplierOrderId: string }[];
  contacts: { id: string }[];
  addresses: { id: string }[];
  cards: { id: string }[];
}

/** COMPLETED or DENIED orders placed before local midnight `retentionDays` ago. */
export function selectPurgeable<T extends BatchOrder>(input: {
  orders: T[];
  now: Date;
  retentionDays?: number;
}): T[] {
  const { now } = input;
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - (input.retentionDays ?? 180),
  );
  return input.orders.filter(
    (o) => (o.status === "COMPLETED" || o.status === "DENIED") && o.orderTime < cutoff,
  );
}

function removeWhere<T>(rows: T[], drop: (row: T) => boolean): void {
  const kept = rows.filter((r) => !drop(r));
  rows.splice(0, rows.length, ...kept);
}

/** Deletes the purgeable orders and every dependent from the store, as one transaction. */
export async function runOrderPurge(input: {
  store: PurgeStore;
  now: Date;
  retentionDays?: number;
}): Promise<{ exitCode: number; purgedOrderIds: string[]; transactions: number }> {
  const { store } = input;
  const doomed = selectPurgeable({
    orders: store.orders,
    now: input.now,
    retentionDays: input.retentionDays,
  });
  if (doomed.length === 0) return { exitCode: EXIT_OK, purgedOrderIds: [], transactions: 0 };

  const ids = new Set(doomed.map((o) => o.orderId));
  const supplierIds = new Set(
    store.supplierOrders.filter((s) => ids.has(s.orderId)).map((s) => s.id),
  );
  const contacts = new Set(doomed.flatMap((o) => (o.contactId ? [o.contactId] : [])));
  const addresses = new Set(doomed.flatMap((o) => (o.addressId ? [o.addressId] : [])));
  const cards = new Set(doomed.flatMap((o) => (o.cardId ? [o.cardId] : [])));

  removeWhere(store.supplierLineItems, (l) => supplierIds.has(l.supplierOrderId));
  removeWhere(store.supplierOrders, (s) => supplierIds.has(s.id));
  removeWhere(store.orderLines, (l) => ids.has(l.orderId));
  removeWhere(store.orderManager, (m) => ids.has(m.orderId));
  removeWhere(store.orders, (o) => ids.has(o.orderId));
  removeWhere(store.contacts, (c) => contacts.has(c.id));
  removeWhere(store.addresses, (a) => addresses.has(a.id));
  removeWhere(store.cards, (c) => cards.has(c.id));
  return { exitCode: EXIT_OK, purgedOrderIds: [...ids], transactions: 1 };
}
