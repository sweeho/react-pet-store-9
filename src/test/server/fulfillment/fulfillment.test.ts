// @vitest-environment node
import { describe, expect, it } from "vitest";
import { line, memoryStore, supplierOrder } from "./helpers";

// Assumed module boundary: server/fulfillment/service.ts exports
//   fulfillSupplierOrder({ store, order, now }): { shippedLines: Line[]; invoice: Invoice | null }
//     Ships each unshipped line in full only when store.inventory[item] >= quantity, deducting stock and
//     setting line.shipped = quantity. Lines with shipped === quantity are skipped. Items absent from
//     store.inventory are unavailable (no throw). order.status becomes COMPLETED only when every line is
//     shipped; otherwise it stays PENDING. invoice is null when nothing shipped in this attempt.
//   Invoice: { orderId, userId, orderDate, shippingDate, greeting, lines: Line[] } (only lines shipped now)
const load = () => import("../../../../server/fulfillment/service");
const now = new Date(2026, 2, 12);

async function attempt(stock: Record<string, number>, lines: ReturnType<typeof line>[]) {
  const { fulfillSupplierOrder } = await load();
  const order = supplierOrder(5, lines);
  const store = memoryStore(stock, [order]);
  const result = fulfillSupplierOrder({ store, order, now });
  return { order, store, result };
}

describe("order fulfilment", () => {
  // case: SWHR8-C-0189@v1
  it("[SWHR8-C-0189] does not ship a line of 5 when stock is 4, and leaves stock unchanged", async () => {
    const { order, store, result } = await attempt({ A: 4 }, [line("A", 5)]);
    expect(order.lines[0].shipped).toBe(0);
    expect(store.inventory.A).toBe(4);
    expect(result.shippedLines).toHaveLength(0);
  });

  // case: SWHR8-C-0190@v1
  it("[SWHR8-C-0190] leaves a line for an unstocked item unshipped without raising an error", async () => {
    const { fulfillSupplierOrder } = await load();
    const order = supplierOrder(5, [line("NOPE", 2)]);
    const store = memoryStore({}, [order]);
    expect(() => fulfillSupplierOrder({ store, order, now })).not.toThrow();
    expect(order.lines[0].shipped).toBe(0);
  });

  // case: SWHR8-C-0201@v1
  it("[SWHR8-C-0201] leaves an unstocked line unshipped and the order open", async () => {
    const { order } = await attempt({}, [line("NOPE", 2)]);
    expect(order.lines[0].shipped).toBe(0);
    expect(order.status).toBe("PENDING");
  });

  // case: SWHR8-C-0220@v1
  it("[SWHR8-C-0220] leaves a line of 8 unshipped when stock is 5 and keeps stock at 5", async () => {
    const { order, store } = await attempt({ A: 5 }, [line("A", 8)]);
    expect(order.lines[0].shipped).toBe(0);
    expect(store.inventory.A).toBe(5);
  });

  // case: SWHR8-C-0228@v1
  it("[SWHR8-C-0228] ships a line of 4 from stock of 10: stock 6 and line fully shipped", async () => {
    const { order, store } = await attempt({ A: 10 }, [line("A", 4)]);
    expect(store.inventory.A).toBe(6);
    expect(order.lines[0].shipped).toBe(4);
  });

  // case: SWHR8-C-0198@v1
  it("[SWHR8-C-0198] invoice carries order id, user id, order date, shipping date and line items", async () => {
    const { result } = await attempt({ A: 10 }, [line("A", 4)]);
    expect(result.invoice).toMatchObject({
      orderId: 5,
      userId: "alice",
      orderDate: new Date(2026, 2, 10),
      shippingDate: now,
    });
    expect(result.invoice?.lines).toHaveLength(1);
    expect(result.invoice?.lines[0].item).toBe("A");
  });

  // case: SWHR8-C-0230@v1
  it("[SWHR8-C-0230] invoice lists only the line shipped now and the label Dear PetStore Customer", async () => {
    const { result } = await attempt({ A: 10, B: 1 }, [
      line("A", 4, { lineNumber: 1 }),
      line("B", 3, { lineNumber: 2 }),
    ]);
    expect(result.invoice?.lines.map((l) => l.item)).toEqual(["A"]);
    expect(result.invoice?.greeting).toBe("Dear PetStore Customer");
  });

  // case: SWHR8-C-0231@v1
  it("[SWHR8-C-0231] a line item carries category, product, item, line number, quantity and unit price in supplier order and invoice", async () => {
    const { result } = await attempt({ A: 10 }, [line("A", 4, { lineNumber: 3, unitPrice: 7.5 })]);
    const { toSupplierOrderDocument } = await import("../../../../server/fulfillment/documents");
    const doc = toSupplierOrderDocument(
      supplierOrder(5, [line("A", 4, { lineNumber: 3, unitPrice: 7.5 })]),
    );
    for (const l of [result.invoice!.lines[0], doc.lineItems[0]]) {
      expect(l).toMatchObject({
        category: "FISH",
        product: "P-A",
        item: "A",
        lineNumber: 3,
        quantity: 4,
        unitPrice: 7.5,
      });
    }
  });
});
