// @vitest-environment node
import { describe, expect, it } from "vitest";
import { incomingOrder, line, supplierOrder } from "./helpers";

// Assumed module boundary: server/fulfillment/documents.ts exports
//   readIncomingOrder(doc, { now }): { orderId, orderDate: Date, ... }   (missing / future / malformed date -> now)
//   readPurchaseOrderDocument(doc): { locale: string, ... }               (locale defaults to "en_US")
//   toSupplierOrderDocument(order): { orderId, orderDate: "yyyy-MM-dd", shippingAddress, lineItems }
//   toSupplierOrderXml(order, { adapter?: boolean }): string
//   serializeDocument(doc, { type }): string       (UTF-8 declaration, indented, document type or namespace)
//   validateDocument(xml, expectedType): { valid: boolean; errors: string[] }
// server/fulfillment/service.ts exports createSupplierPurchaseOrder(incoming, { now }): SupplierOrder
// server/fulfillment/line-item.ts exports createLineItem(from, { shipped }), setShipped(line, n), lineSnapshot(line)
// server/fulfillment/order-status.ts exports setOrderStatus(order, status) (throws on unknown status)
// server/fulfillment/identifiers.ts exports nextIdentifier(counters, kind): number (counters: Record<string, number>)
// server/fulfillment/process-manager.ts exports deliverMessage({ delegateClass, registry, message }): Promise<void>
//   registry maps class name -> (message) => void | Promise<void>; a failing delegate rejects with a transition error.
const docs = () => import("../../../server/fulfillment/documents");
const service = () => import("../../../server/fulfillment/service");
const now = new Date(2026, 2, 12);

describe("order documents", () => {
  // case: SWHR8-C-0205@v1
  it("[SWHR8-C-0205] replaces an order dated 'tomorrow' with the current date and continues", async () => {
    const { readIncomingOrder } = await docs();
    const tomorrow = "2026-03-13";
    const order = readIncomingOrder({ ...incomingOrder(7), orderDate: tomorrow }, { now });
    expect(order.orderDate).toEqual(now);
    expect(order.orderId).toBe(7);
  });

  // case: SWHR8-C-0206@v1
  it("[SWHR8-C-0206] a new supplier purchase order carries id 7, the order date and PENDING", async () => {
    const { createSupplierPurchaseOrder } = await service();
    const order = createSupplierPurchaseOrder(incomingOrder(7), { now });
    expect(order.id).toBe(7);
    expect(order.orderDate).toEqual(new Date(2026, 2, 10));
    expect(order.status).toBe("PENDING");
  });

  // case: SWHR8-C-0208@v1
  it("[SWHR8-C-0208] supplier order document carries order id, date, shipping address and line items", async () => {
    const { toSupplierOrderDocument } = await docs();
    const doc = toSupplierOrderDocument(
      supplierOrder(9, [line("A", 2)], { orderDate: new Date(2026, 2, 10) }),
    );
    expect(doc.orderId).toBe(9);
    expect(doc.orderDate).toBe("2026-03-10");
    expect(doc.shippingAddress).toBeDefined();
    expect(doc.lineItems).toHaveLength(1);
  });

  // case: SWHR8-C-0213@v1
  it("[SWHR8-C-0213] a purchase order document without a locale attribute reads as en_US", async () => {
    const { readPurchaseOrderDocument } = await docs();
    const po = readPurchaseOrderDocument({ ...incomingOrder(3), locale: undefined });
    expect(po.locale).toBe("en_US");
  });

  // case: SWHR8-C-0218@v1
  it("[SWHR8-C-0218] schema validation rejects a document of the wrong type", async () => {
    const { toSupplierOrderXml, validateDocument } = await docs();
    const xml = toSupplierOrderXml(supplierOrder(1, [line("A", 1)]), {});
    expect(validateDocument(xml, "SupplierOrder").valid).toBe(true);
    const result = validateDocument(xml, "Invoice");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // case: SWHR8-C-0219@v1
  it("[SWHR8-C-0219] serialised documents are UTF-8, indented and carry a document type or namespace", async () => {
    const { toSupplierOrderXml } = await docs();
    const xml = toSupplierOrderXml(supplierOrder(1, [line("A", 1)]), {});
    expect(xml).toMatch(/^<\?xml[^>]*encoding="UTF-8"/i);
    expect(xml).toMatch(/\n[ \t]+<\w/);
    expect(xml).toMatch(/<!DOCTYPE|xmlns=/);
  });

  // case: SWHR8-C-0226@v1
  it("[SWHR8-C-0226] an order produced by the adapter editor carries the supplier order namespace", async () => {
    const { toSupplierOrderXml } = await docs();
    const xml = toSupplierOrderXml(supplierOrder(1, [line("A", 1)]), { adapter: true });
    expect(xml).toMatch(/xmlns="[^"]*supplier[^"]*order[^"]*"/i);
  });

  // case: SWHR8-C-0209@v1
  it("[SWHR8-C-0209] a line item created from an existing one copies the fields and has shipped 0", async () => {
    const { createLineItem } = await import("../../../server/fulfillment/line-item");
    const source = line("A", 6, { shipped: 6, lineNumber: 2, unitPrice: 3 });
    const copy = createLineItem(source, { shipped: 0 });
    expect(copy).toMatchObject({
      category: "FISH",
      product: "P-A",
      item: "A",
      lineNumber: 2,
      quantity: 6,
      unitPrice: 3,
      shipped: 0,
    });
  });

  // case: SWHR8-C-0210@v1
  it("[SWHR8-C-0210] shipped set to 4 shows 4 shipped, and the snapshot has no shipped quantity", async () => {
    const { setShipped, lineSnapshot } = await import("../../../server/fulfillment/line-item");
    const l = line("A", 6);
    setShipped(l, 4);
    expect(l.shipped).toBe(4);
    const snap = lineSnapshot(l);
    expect(snap).not.toHaveProperty("shipped");
    expect(snap).toMatchObject({ item: "A", quantity: 6 });
  });

  // case: SWHR8-C-0217@v1
  it("[SWHR8-C-0217] only PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED are accepted as order status", async () => {
    const { setOrderStatus } = await import("../../../server/fulfillment/order-status");
    for (const s of ["PENDING", "APPROVED", "DENIED", "SHIPPED_PART", "COMPLETED"]) {
      const o = { status: "PENDING" };
      setOrderStatus(o, s);
      expect(o.status).toBe(s);
    }
    const o = { status: "PENDING" };
    expect(() => setOrderStatus(o, "BOGUS")).toThrow();
    expect(o.status).toBe("PENDING");
  });

  // case: SWHR8-C-0199@v1
  it("[SWHR8-C-0199] an identifier is the next value of the named counter for its kind", async () => {
    const { nextIdentifier } = await import("../../../server/fulfillment/identifiers");
    const counters = { order: 41, purchaseOrder: 900 };
    expect(nextIdentifier(counters, "order")).toBe(42);
    expect(nextIdentifier(counters, "purchaseOrder")).toBe(901);
    expect(nextIdentifier(counters, "order")).toBe(43);
  });

  // case: SWHR8-C-0225@v1
  it("[SWHR8-C-0225] a delegate named by class that throws yields a transition error", async () => {
    const { deliverMessage } = await import("../../../server/fulfillment/process-manager");
    const registry = {
      FailingDelegate: () => {
        throw new Error("boom");
      },
    };
    await expect(
      deliverMessage({ delegateClass: "FailingDelegate", registry, message: { orderId: 1 } }),
    ).rejects.toThrow(/transition/i);
  });
});
