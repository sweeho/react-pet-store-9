// Order-center completion rules (change swhr8-i-0010, design F3). Pure over plain objects.
import { createLineItem, type LineItem } from "./line-item";
import { setOrderStatus } from "./order-status";
import { toSupplierOrderDocument, type SupplierOrderDocument } from "./documents";

export interface CenterOrder {
  id: number | string;
  status: string;
  userId?: string;
  orderDate?: Date;
  shippingAddress?: SupplierOrderDocument["shippingAddress"];
  lines: LineItem[];
}

export interface CenterInvoice {
  orderId: number | string;
  lines: { item: string; quantity: number }[];
}

/** Adds each invoiced quantity to the line carrying that item, capped at the ordered quantity. */
export function applyInvoice({
  order,
  invoice,
}: {
  order: Pick<CenterOrder, "lines">;
  invoice: CenterInvoice;
}): void {
  for (const shipped of invoice.lines) {
    const line = order.lines.find((l) => l.item === shipped.item && l.shipped < l.quantity);
    if (line) line.shipped = Math.min(line.quantity, line.shipped + shipped.quantity);
  }
}

export const isFullyFulfilled = (order: Pick<CenterOrder, "lines">): boolean =>
  order.lines.every((l) => l.shipped === l.quantity);

/** COMPLETED (and one notification) when every line is fulfilled, otherwise SHIPPED_PART with none. */
export function receiveInvoice<O extends Pick<CenterOrder, "lines" | "status">>({
  order,
  invoice,
  notify,
}: {
  order: O;
  invoice: CenterInvoice;
  notify: (order: O) => void;
}): void {
  applyInvoice({ order, invoice });
  if (isFullyFulfilled(order)) {
    setOrderStatus(order, "COMPLETED");
    notify(order);
  } else {
    setOrderStatus(order, "SHIPPED_PART");
  }
}

/** Builds the supplier purchase order for a newly approved order and puts it on the queue. */
export function sendSupplierPurchaseOrder({
  order,
  queue,
}: {
  order: CenterOrder;
  queue: { send(document: SupplierOrderDocument): void };
}): void {
  const doc = toSupplierOrderDocument({
    id: Number(order.id),
    userId: order.userId,
    orderDate: order.orderDate ?? new Date(),
    status: order.status,
    contact: order.shippingAddress,
    lines: order.lines.map((l) => createLineItem(l, { shipped: 0 })),
  });
  queue.send(doc);
}
