// @vitest-environment node
import { describe, expect, it } from "vitest";

import { runOrderPurge, selectPurgeable, type PurgeStore } from "../../server/jobs/order-purge";
import type { BatchOrder } from "../../server/jobs/order-extract";

type Order = BatchOrder;

const order = (orderId: string, orderTime: Date, over: Partial<BatchOrder> = {}): BatchOrder => ({
  orderId,
  userName: "alice",
  orderTime,
  locale: "en_US",
  value: 123.45,
  lineCount: 2,
  status: "COMPLETED",
  ...over,
});
const hoursBefore = (now: Date, h: number): Date => new Date(now.getTime() - h * 3_600_000);
const daysAgo = (now: Date, d: number): Date => hoursBefore(now, d * 24);

const now = new Date(2026, 2, 22, 2, 0);

type Linked = Order & { contactId: string; addressId: string; cardId: string };
const linked = (id: string, age: number, status: Order["status"]): Linked => ({
  ...order(id, daysAgo(now, age), { status }),
  contactId: `c-${id}`,
  addressId: `a-${id}`,
  cardId: `k-${id}`,
});
const storeFor = (orders: Linked[]): PurgeStore => ({
  orders: [...orders],
  orderLines: orders.map((o) => ({ orderId: o.orderId })),
  orderManager: orders.map((o) => ({ orderId: o.orderId })),
  supplierOrders: orders.map((o) => ({
    id: `so-${o.orderId}`,
    orderId: o.orderId,
    status: "COMPLETED",
  })),
  supplierLineItems: orders.map((o) => ({ supplierOrderId: `so-${o.orderId}` })),
  contacts: orders.map((o) => ({ id: o.contactId })),
  addresses: orders.map((o) => ({ id: o.addressId })),
  cards: orders.map((o) => ({ id: o.cardId })),
});
async function purge(orders: Linked[]) {
  const store = storeFor(orders);
  return { store, result: await runOrderPurge({ store, now }) };
}

describe("order purge", () => {
  it("[SWHR8-C-0119] selects only COMPLETED/DENIED orders older than the retention cutoff", () => {
    const orders = [
      order("OLD-DONE", daysAgo(now, 200), { status: "COMPLETED" }),
      order("OLD-DENIED", daysAgo(now, 200), { status: "DENIED" }),
      order("NEW-DONE", daysAgo(now, 170), { status: "COMPLETED" }),
      order("OLD-PENDING", daysAgo(now, 400), { status: "PENDING" }),
    ];
    expect(selectPurgeable({ orders, now, retentionDays: 180 }).map((o) => o.orderId)).toEqual([
      "OLD-DONE",
      "OLD-DENIED",
    ]);
    expect(selectPurgeable({ orders, now }).map((o) => o.orderId)).toHaveLength(2);
  });

  it("[SWHR8-C-0128] deletes the address", async () => {
    const { store } = await purge([linked("A1", 200, "COMPLETED")]);
    expect(store.addresses).toEqual([]);
  });

  it("[SWHR8-C-0129] deletes the contact", async () => {
    const { store } = await purge([linked("D1", 200, "DENIED")]);
    expect(store.contacts).toEqual([]);
  });

  it("[SWHR8-C-0130] deletes the card", async () => {
    const { store } = await purge([linked("C1", 200, "COMPLETED")]);
    expect(store.cards).toEqual([]);
  });

  it("[SWHR8-C-0133] deletes the order and every dependent in one transaction, keeping others", async () => {
    const { store, result } = await purge([
      linked("X1", 200, "COMPLETED"),
      linked("K1", 10, "COMPLETED"),
    ]);
    expect(result).toEqual({ exitCode: 0, purgedOrderIds: ["X1"], transactions: 1 });
    expect(store.orders.map((o) => o.orderId)).toEqual(["K1"]);
    for (const rows of [
      store.orderLines,
      store.orderManager,
      store.supplierOrders,
      store.supplierLineItems,
      store.contacts,
      store.addresses,
      store.cards,
    ]) {
      expect(rows).toHaveLength(1);
    }
  });

  it("[SWHR8-C-0134] keeps a 400-day-old PENDING order and its dependents", async () => {
    const { store, result } = await purge([linked("P1", 400, "PENDING")]);
    expect(result.purgedOrderIds).toEqual([]);
    expect(result.transactions).toBe(0);
    expect(store.orders).toHaveLength(1);
    expect(store.cards).toHaveLength(1);
  });
});
