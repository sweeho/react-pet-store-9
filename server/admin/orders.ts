// Database-backed reads and the OrderApproval hand-off behind the admin order routes
// (change swhr8-i-0011, design M4-M6). The rules themselves live in server/lib/admin-*.ts.
import { eq } from "drizzle-orm";

import { db } from "../../db/client";
import { orderLineItem, purchaseOrder } from "../../db/schema";
import { databaseQueue, APPROVAL_QUEUE, scheduleApprovalDrain } from "../approval/queue";
import { sendMessage } from "../approval/service";
import { statusRecords } from "../checkout/repository";
import { listOrdersByStatus } from "../lib/admin-orders";
import type { PublishDecisions } from "../lib/admin-requests";
import type { SalesLine } from "../lib/admin-sales";

export function readOrdersByStatus(status: string) {
  const purchaseOrders = db
    .select({
      orderId: purchaseOrder.orderId,
      userId: purchaseOrder.userId,
      orderDate: purchaseOrder.orderDate,
      value: purchaseOrder.total,
    })
    .from(purchaseOrder)
    .all()
    .map((o) => ({ ...o, userId: o.userId ?? "" }));
  return listOrdersByStatus({
    purchaseOrders,
    statusRecords: [...statusRecords(db).values()],
    status,
  });
}

const pad = (n: number): string => String(n).padStart(2, "0");
/** The local calendar date of an order, `yyyy-mm-dd`. */
export const isoDate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function readSalesLines(): SalesLine[] {
  return db
    .select({
      orderDate: purchaseOrder.orderDate,
      category: orderLineItem.categoryId,
      itemId: orderLineItem.itemId,
      quantity: orderLineItem.quantity,
      unitPrice: orderLineItem.unitPrice,
    })
    .from(orderLineItem)
    .innerJoin(purchaseOrder, eq(purchaseOrder.orderId, orderLineItem.orderId))
    .all()
    .map((l) => ({ ...l, orderDate: isoDate(l.orderDate) }));
}

const escapeXml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One OrderApproval document with one Order per entry, queued for the approval drain. */
export const publishDecisions: PublishDecisions = ({ orders }) => {
  const body = orders
    .map(
      (o) =>
        `<Order><OrderId>${escapeXml(o.orderId)}</OrderId>` +
        `<OrderStatus>${escapeXml(o.status)}</OrderStatus></Order>`,
    )
    .join("");
  sendMessage({
    queue: databaseQueue(APPROVAL_QUEUE),
    message: `<?xml version="1.0"?><OrderApproval>${body}</OrderApproval>`,
  });
  scheduleApprovalDrain();
  return Promise.resolve();
};
