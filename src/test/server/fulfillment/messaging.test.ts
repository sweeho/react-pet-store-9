// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { incomingOrder, line, memoryStore, supplierOrder } from "./helpers";

// Assumed module boundary: server/fulfillment/service.ts exports
//   receivePurchaseOrder({ message, store, publish, now }): { accepted: boolean; supplierOrder: SupplierOrder; invoice: Invoice | null }
//     message: incoming purchase order document (see helpers.incomingOrder). Validates, stores a PENDING
//     supplier order in store.supplierOrders, attempts fulfilment at once and, when an invoice is produced,
//     calls publish(invoice).
//   createSupplierOrder({ incoming, store }): SupplierOrder   builds order, one contact and the lines inside ONE store.transaction
//   updateInventory({ store, quantities, publish }): void
//     Within a single store.transaction: sets store.inventory[item] for each non-negative numeric quantity
//     (blank / negative values are ignored), re-attempts every PENDING supplier order and publish(invoice) for each invoice.
//   publishInvoices({ invoices, connectionFactory }): void
//     connectionFactory() -> { send(text: string): void; close(): void }; one new connection per invoice, text message.
const svc = () => import("../../../../server/fulfillment/service");
const now = new Date(2026, 2, 12);

describe("supplier order intake and invoicing", () => {
  // case: SWHR8-C-0188@v1
  it("[SWHR8-C-0188] sets item 1 to 10 and leaves item 2 unchanged when its entry is negative", async () => {
    const { updateInventory } = await svc();
    const store = memoryStore({ ITEM1: 3, ITEM2: 7 });
    updateInventory({ store, quantities: { ITEM1: 10, ITEM2: -4 }, publish: vi.fn(), now });
    expect(store.inventory.ITEM1).toBe(10);
    expect(store.inventory.ITEM2).toBe(7);
  });

  // case: SWHR8-C-0191@v1
  it("[SWHR8-C-0191] a supplier order document with id, date, contact and one line is accepted", async () => {
    const { receivePurchaseOrder } = await svc();
    const store = memoryStore({});
    const result = receivePurchaseOrder({
      message: incomingOrder(11),
      store,
      publish: vi.fn(),
      now,
    });
    expect(result.accepted).toBe(true);
    expect(store.supplierOrders.map((o) => o.id)).toContain(11);
  });

  // case: SWHR8-C-0194@v1
  it("[SWHR8-C-0194] when no line can ship, no invoice is forwarded and the order waits as PENDING", async () => {
    const { receivePurchaseOrder } = await svc();
    const store = memoryStore({ "EST-1": 0 });
    const publish = vi.fn();
    const result = receivePurchaseOrder({ message: incomingOrder(12), store, publish, now });
    expect(publish).not.toHaveBeenCalled();
    expect(result.invoice).toBeNull();
    expect(store.supplierOrders[0].status).toBe("PENDING");
  });

  // case: SWHR8-C-0197@v1
  it("[SWHR8-C-0197] when nothing is shippable no invoice is produced and the order stays PENDING", async () => {
    const { receivePurchaseOrder } = await svc();
    const store = memoryStore({});
    const result = receivePurchaseOrder({
      message: incomingOrder(13, [{ item: "UNKNOWN" }]),
      store,
      publish: vi.fn(),
      now,
    });
    expect(result.invoice).toBeNull();
    expect(result.supplierOrder.status).toBe("PENDING");
  });

  // case: SWHR8-C-0202@v1
  it("[SWHR8-C-0202] a purchase order message is stored as a supplier order and fulfilment is attempted at once", async () => {
    const { receivePurchaseOrder } = await svc();
    const store = memoryStore({ "EST-1": 5 });
    const publish = vi.fn();
    receivePurchaseOrder({ message: incomingOrder(14, [{ quantity: 2 }]), store, publish, now });
    expect(store.supplierOrders).toHaveLength(1);
    expect(store.supplierOrders[0].lines[0].shipped).toBe(2);
    expect(store.inventory["EST-1"]).toBe(3);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  // case: SWHR8-C-0214@v1
  it("[SWHR8-C-0214] an incoming order with three lines is assembled with one contact and three line items in one transaction", async () => {
    const { createSupplierOrder } = await svc();
    const store = memoryStore({});
    const order = createSupplierOrder({ incoming: incomingOrder(15, [{}, {}, {}]), store });
    expect(order.contact).toBeDefined();
    expect(order.lines).toHaveLength(3);
    expect(store.transactions).toBe(1);
  });

  // case: SWHR8-C-0215@v1
  it("[SWHR8-C-0215] two invoices are each published as a text message on their own connection", async () => {
    const { publishInvoices } = await svc();
    const connections: { sent: unknown[]; closed: boolean }[] = [];
    const connectionFactory = () => {
      const c = { sent: [] as unknown[], closed: false };
      connections.push(c);
      return { send: (t: unknown) => c.sent.push(t), close: () => (c.closed = true) };
    };
    const invoices = [1, 2].map((orderId) => ({ orderId, userId: "alice", lines: [line("A", 1)] }));
    publishInvoices({ invoices, connectionFactory });
    expect(connections).toHaveLength(2);
    for (const c of connections) {
      expect(c.sent).toHaveLength(1);
      expect(typeof c.sent[0]).toBe("string");
    }
  });

  // case: SWHR8-C-0221@v1
  it("[SWHR8-C-0221] a shipped line is skipped, the available line ships and the order becomes COMPLETED", async () => {
    const { fulfillSupplierOrder } = await svc();
    const order = supplierOrder(16, [
      line("A", 3, { shipped: 3 }),
      line("B", 2, { lineNumber: 2 }),
    ]);
    const store = memoryStore({ A: 9, B: 5 }, [order]);
    const { invoice } = fulfillSupplierOrder({ store, order, now });
    expect(store.inventory.A).toBe(9);
    expect(store.inventory.B).toBe(3);
    expect(order.lines.map((l) => l.shipped)).toEqual([3, 2]);
    expect(order.status).toBe("COMPLETED");
    expect(invoice?.lines.map((l) => l.item)).toEqual(["B"]);
  });

  // case: SWHR8-C-0223@v1
  it("[SWHR8-C-0223] a stock update ships a pending order in the same transaction and forwards its invoice", async () => {
    const { updateInventory } = await svc();
    const order = supplierOrder(17, [line("A", 4)]);
    const store = memoryStore({ A: 1 }, [order]);
    const publish = vi.fn();
    updateInventory({ store, quantities: { A: 6 }, publish, now });
    expect(order.lines[0].shipped).toBe(4);
    expect(order.status).toBe("COMPLETED");
    expect(store.inventory.A).toBe(2);
    expect(store.transactions).toBe(1);
    expect(publish).toHaveBeenCalledTimes(1);
  });
});
