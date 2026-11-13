// Supplier-side fulfilment rules (change swhr8-i-0010, design F1-F3, F12). Pure over an injected
// store, publisher and clock; production adapters live in store.ts and queue.ts.
import {
  InvalidDocumentError,
  INVOICE_GREETING,
  invoiceToXml,
  readIncomingOrder,
  type Address,
  type IncomingOrder,
  type Invoice,
} from "./documents";
import { createLineItem, type LineItem } from "./line-item";

export interface SupplierOrder {
  id: number;
  userId?: string;
  orderDate: Date;
  status: "PENDING" | "COMPLETED";
  contact?: Address & { address1?: string; postalCode?: string };
  lines: LineItem[];
}

/** The supplier's working set: stock by item id and the orders still being worked. */
export interface Store {
  inventory: Record<string, number>;
  supplierOrders: SupplierOrder[];
  transaction: <T>(fn: () => T) => T;
}

export type PublishInvoice = (invoice: Invoice) => void;

/**
 * Ships each unshipped line in full only when stock suffices (R-0010), skips shipped lines, treats an
 * item with no stock record as unavailable (R-0011) and completes the order only when every line has
 * shipped. The invoice lists the lines shipped in this attempt, or is null when none shipped.
 */
export function fulfillSupplierOrder({
  store,
  order,
  now,
}: {
  store: Pick<Store, "inventory">;
  order: SupplierOrder;
  now: Date;
}): { shippedLines: LineItem[]; invoice: Invoice | null } {
  const shippedLines: LineItem[] = [];
  for (const line of order.lines) {
    const remaining = line.quantity - line.shipped;
    if (remaining <= 0) continue;
    const stock = Object.hasOwn(store.inventory, line.item)
      ? store.inventory[line.item]
      : undefined;
    if (stock === undefined || stock < remaining) continue;
    store.inventory[line.item] = stock - remaining;
    line.shipped = line.quantity;
    shippedLines.push({ ...createLineItem(line, { shipped: remaining }), quantity: remaining });
  }
  if (order.lines.every((l) => l.shipped >= l.quantity)) order.status = "COMPLETED";
  const invoice: Invoice | null = shippedLines.length
    ? {
        orderId: order.id,
        userId: order.userId,
        orderDate: order.orderDate,
        shippingDate: now,
        greeting: INVOICE_GREETING,
        lines: shippedLines,
      }
    : null;
  return { shippedLines, invoice };
}

/** A new PENDING supplier order with one contact and its lines (shipped 0), from a received order. */
export function createSupplierPurchaseOrder(
  incoming: IncomingOrder,
  { now }: { now: Date },
): SupplierOrder {
  const read = readIncomingOrder(incoming, { now });
  const a = read.shippingAddress;
  return {
    id: read.orderId,
    userId: read.userId,
    orderDate: read.orderDate,
    status: "PENDING",
    contact: a && {
      ...a,
      address1: a.street,
      postalCode: a.zipCode,
    },
    lines: read.lines.map((l) => createLineItem(l, { shipped: 0 })),
  };
}

function assertValid(incoming: IncomingOrder): void {
  if (!Number.isInteger(incoming.orderId)) throw new InvalidDocumentError("Order id is missing");
  if (!incoming.shippingAddress) throw new InvalidDocumentError("Shipping address is missing");
  if (!incoming.lines?.length) throw new InvalidDocumentError("The order has no line items");
  for (const l of incoming.lines) {
    if (
      !l.item ||
      !Number.isInteger(l.quantity) ||
      l.quantity <= 0 ||
      !Number.isFinite(l.unitPrice)
    ) {
      throw new InvalidDocumentError(`Invalid line item ${l.lineNumber}`);
    }
  }
}

/** Builds the order, its one contact and its lines inside ONE store transaction (R-0108). */
export function createSupplierOrder({
  incoming,
  store,
  now = new Date(),
}: {
  incoming: IncomingOrder;
  store: Store;
  now?: Date;
}): SupplierOrder {
  return store.transaction(() => {
    const order = createSupplierPurchaseOrder(incoming, { now });
    store.supplierOrders.push(order);
    return order;
  });
}

/**
 * Stores the order as PENDING and attempts fulfilment at once, publishing the invoice when something
 * shipped. A malformed document throws an InvalidDocumentError and stores nothing (R-0012, R-0116).
 */
export function receivePurchaseOrder({
  message,
  store,
  publish,
  now,
}: {
  message: IncomingOrder;
  store: Store;
  publish: PublishInvoice;
  now: Date;
}): { accepted: boolean; supplierOrder: SupplierOrder; invoice: Invoice | null } {
  assertValid(message);
  return store.transaction(() => {
    const supplierOrder = createSupplierPurchaseOrder(message, { now });
    store.supplierOrders.push(supplierOrder);
    const { invoice } = fulfillSupplierOrder({ store, order: supplierOrder, now });
    if (invoice) publish(invoice);
    return { accepted: true, supplierOrder, invoice };
  });
}

/** A whole, non-negative number from a number or a numeric text; anything else is undefined. */
export function toQuantity(value: unknown): number | undefined {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\s*\d+\s*$/.test(value)
        ? Number(value)
        : Number.NaN;
  return Number.isSafeInteger(n) && n >= 0 ? n : undefined;
}

/**
 * Sets stock for each valid entry (blank, negative or non-numeric ones are ignored, R-0009) and
 * re-attempts every PENDING supplier order, all in one transaction (R-0151).
 */
export function updateInventory({
  store,
  quantities,
  publish,
  now = new Date(),
}: {
  store: Store;
  quantities: Record<string, unknown>;
  publish: PublishInvoice;
  now?: Date;
}): void {
  store.transaction(() => {
    for (const [item, value] of Object.entries(quantities)) {
      const quantity = toQuantity(value);
      if (quantity !== undefined) store.inventory[item] = quantity;
    }
    for (const order of store.supplierOrders) {
      if (order.status !== "PENDING") continue;
      const { invoice } = fulfillSupplierOrder({ store, order, now });
      if (invoice) publish(invoice);
    }
  });
}

/** Sends each invoice as a text message on its own connection (R-0117). */
export function publishInvoices({
  invoices,
  connectionFactory,
}: {
  invoices: Invoice[];
  connectionFactory: () => { send(text: string): void; close(): void };
}): void {
  for (const invoice of invoices) {
    const connection = connectionFactory();
    try {
      connection.send(invoiceToXml(invoice));
    } finally {
      connection.close();
    }
  }
}
