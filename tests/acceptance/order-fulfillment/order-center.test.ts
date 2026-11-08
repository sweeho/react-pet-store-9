// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { line } from "./helpers";

// Assumed module boundary: server/fulfillment/order-center.ts exports
//   applyInvoice({ order, invoice }): void  -- adds invoice line quantities to order.lines[].shipped by item
//   isFullyFulfilled(order): boolean        -- every line shipped === quantity
//   receiveInvoice({ order, invoice, notify }): void
//     applyInvoice, then status COMPLETED (and notify(order) once) when fully fulfilled, else SHIPPED_PART (no notify)
//   sendSupplierPurchaseOrder({ order, queue }): void   queue: { send(doc): void }
const load = () => import("../../../server/fulfillment/order-center");

const mkOrder = (lines: ReturnType<typeof line>[]) => ({ id: 1, status: "APPROVED", lines });
const invoiceFor = (...shipped: [string, number][]) => ({
  orderId: 1,
  lines: shipped.map(([item, quantity]) => line(item, quantity)),
});

describe("order center completion", () => {
  // case: SWHR8-C-0203@v1
  it("[SWHR8-C-0203] a line with 2 shipped shows 5 after an invoice reports 3 for the item", async () => {
    const { applyInvoice } = await load();
    const order = mkOrder([line("A", 10, { shipped: 2 })]);
    applyInvoice({ order, invoice: invoiceFor(["A", 3]) });
    expect(order.lines[0].shipped).toBe(5);
  });

  // case: SWHR8-C-0204@v1
  it("[SWHR8-C-0204] an order with one partly shipped line is not completely fulfilled", async () => {
    const { isFullyFulfilled } = await load();
    const order = mkOrder([
      line("A", 4, { shipped: 4 }),
      line("B", 5, { shipped: 2, lineNumber: 2 }),
    ]);
    expect(isFullyFulfilled(order)).toBe(false);
  });

  // case: SWHR8-C-0216@v1
  it("[SWHR8-C-0216] an order whose lines are all shipped to ordered quantity after an invoice is completely fulfilled", async () => {
    const { applyInvoice, isFullyFulfilled } = await load();
    const order = mkOrder([
      line("A", 4, { shipped: 1 }),
      line("B", 5, { shipped: 5, lineNumber: 2 }),
    ]);
    applyInvoice({ order, invoice: invoiceFor(["A", 3]) });
    expect(isFullyFulfilled(order)).toBe(true);
  });

  // case: SWHR8-C-0195@v1
  it("[SWHR8-C-0195] a partial invoice sets SHIPPED_PART and sends no completed-order notification", async () => {
    const { receiveInvoice } = await load();
    const notify = vi.fn();
    const order = mkOrder([line("A", 4), line("B", 5, { lineNumber: 2 })]);
    receiveInvoice({ order, invoice: invoiceFor(["A", 4]), notify });
    expect(order.status).toBe("SHIPPED_PART");
    expect(notify).not.toHaveBeenCalled();
  });

  // case: SWHR8-C-0196@v1
  it("[SWHR8-C-0196] a newly approved order results in a supplier purchase order on the queue", async () => {
    const { sendSupplierPurchaseOrder } = await load();
    const sent: unknown[] = [];
    sendSupplierPurchaseOrder({
      order: mkOrder([line("A", 4)]),
      queue: { send: (d: unknown) => sent.push(d) },
    });
    expect(sent).toHaveLength(1);
    expect(JSON.stringify(sent[0])).toContain("A");
  });
});
