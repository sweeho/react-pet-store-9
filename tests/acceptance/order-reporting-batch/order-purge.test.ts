// @vitest-environment node
import { describe, expect, it } from "vitest";
import { type Order, daysAgo, order } from "./helpers";

// Assumed module boundary: server/jobs/order-purge.ts exports
//   selectPurgeable({ orders, now, retentionDays? }): Order[]
//     COMPLETED or DENIED orders earlier than local midnight retentionDays (default 180) ago.
//   runOrderPurge({ store, now, retentionDays? }): Promise<{ exitCode: number; purgedOrderIds: string[]; transactions: number }>
//     Mutates the store arrays in place; every purge happens inside one transaction (transactions === 1).
// store: {
//   orders: (Order & { contactId?, addressId?, cardId? })[], orderLines: { orderId }[], orderManager: { orderId }[],
//   supplierOrders: { id, orderId, status }[], supplierLineItems: { supplierOrderId }[],
//   contacts: { id }[], addresses: { id }[], cards: { id }[] }
const loadPurge = () => import("../../../server/jobs/order-purge");

const now = new Date(2026, 2, 22, 2, 0); // a Sunday, 02:00 local

type Linked = Order & { contactId: string; addressId: string; cardId: string };
const linked = (id: string, age: number, status: Order["status"]): Linked => ({
  ...order(id, daysAgo(now, age), { status }),
  contactId: `contact-${id}`,
  addressId: `address-${id}`,
  cardId: `card-${id}`,
});

function storeFor(orders: Linked[]) {
  return {
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
  };
}

async function purge(orders: Linked[]) {
  const { runOrderPurge } = await loadPurge();
  const store = storeFor(orders);
  const result = await runOrderPurge({ store, now });
  return { store, result };
}

describe("order purge", () => {
  // case: SWHR8-C-0119@v1
  it("[SWHR8-C-0119] with 180-day retention only COMPLETED or DENIED orders older than 180 days are eligible", async () => {
    const { selectPurgeable } = await loadPurge();
    const orders = [
      order("OLD-DONE", daysAgo(now, 200), { status: "COMPLETED" }),
      order("OLD-DENIED", daysAgo(now, 200), { status: "DENIED" }),
      order("NEW-DONE", daysAgo(now, 170), { status: "COMPLETED" }),
      order("OLD-PENDING", daysAgo(now, 400), { status: "PENDING" }),
      order("OLD-APPROVED", daysAgo(now, 400), { status: "APPROVED" }),
    ];

    const eligible = selectPurgeable({ orders, now, retentionDays: 180 });

    expect(eligible.map((o) => o.orderId).sort()).toEqual(["OLD-DENIED", "OLD-DONE"]);
  });

  // case: SWHR8-C-0128@v1
  it("[SWHR8-C-0128] deletes the address of a purged COMPLETED order", async () => {
    const { store } = await purge([linked("A1", 200, "COMPLETED")]);

    expect(store.addresses.find((a) => a.id === "address-A1")).toBeUndefined();
  });

  // case: SWHR8-C-0129@v1
  it("[SWHR8-C-0129] deletes the contact information of a purged DENIED order", async () => {
    const { store } = await purge([linked("D1", 200, "DENIED")]);

    expect(store.contacts.find((c) => c.id === "contact-D1")).toBeUndefined();
  });

  // case: SWHR8-C-0130@v1
  it("[SWHR8-C-0130] deletes the stored payment card of a purged COMPLETED order", async () => {
    const { store } = await purge([linked("C1", 200, "COMPLETED")]);

    expect(store.cards.find((c) => c.id === "card-C1")).toBeUndefined();
  });

  // case: SWHR8-C-0133@v1
  it("[SWHR8-C-0133] deletes an old COMPLETED order and all dependents in one transaction", async () => {
    const { store, result } = await purge([linked("X1", 200, "COMPLETED")]);

    expect(result.purgedOrderIds).toEqual(["X1"]);
    expect(result.transactions).toBe(1);
    expect(store.orders).toHaveLength(0);
    expect(store.orderLines).toHaveLength(0);
    expect(store.orderManager).toHaveLength(0);
    expect(store.supplierOrders).toHaveLength(0);
    expect(store.supplierLineItems).toHaveLength(0);
    expect(store.contacts).toHaveLength(0);
    expect(store.addresses).toHaveLength(0);
    expect(store.cards).toHaveLength(0);
  });

  // case: SWHR8-C-0134@v1
  it("[SWHR8-C-0134] keeps a PENDING order dated 400 days ago with its dependents", async () => {
    const { store, result } = await purge([linked("P1", 400, "PENDING")]);

    expect(result.purgedOrderIds).toEqual([]);
    expect(store.orders.map((o) => o.orderId)).toEqual(["P1"]);
    expect(store.orderLines).toHaveLength(1);
    expect(store.orderManager).toHaveLength(1);
    expect(store.supplierOrders).toHaveLength(1);
    expect(store.supplierLineItems).toHaveLength(1);
    expect(store.contacts).toHaveLength(1);
    expect(store.addresses).toHaveLength(1);
    expect(store.cards).toHaveLength(1);
  });
});
