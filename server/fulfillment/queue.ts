// Drains for order fulfilment (change swhr8-i-0010, design F3): order-decision -> supplier-purchase-order
// -> invoice -> order-status-mail. Each row is handled in one transaction; a failed row stays queued,
// a malformed one or one for an unknown order is marked rejected so it is not retried forever.
import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/client";
import { queueMessage } from "../../db/schema";
import { DECISION_QUEUE, databaseQueue } from "../approval/queue";
import { parseApprovalDocument, sendMessage } from "../approval/service";
import {
  readOrderForFulfillment,
  updateOrderStatus,
  writeShippedQuantities,
  type Db,
  type FulfillmentOrder,
} from "../checkout/repository";
import { orderEventDocument, ORDER_STATUS_MAIL_QUEUE } from "../notifications/order-mail";
import { scheduleStatusMailDrain } from "../notifications/queue";
import {
  InvalidDocumentError,
  parseIncomingOrderXml,
  parseInvoiceXml,
  serializeDocument,
} from "./documents";
import { receiveInvoice, sendSupplierPurchaseOrder, type CenterOrder } from "./order-center";
import { deliverMessage, TransitionError, type TransitionDelegate } from "./process-manager";
import { loadSupplierOrder } from "./repository";
import { publishInvoices, receivePurchaseOrder } from "./service";
import { withDatabaseStore } from "./store";

export const SUPPLIER_PURCHASE_ORDER_QUEUE = "supplier-purchase-order";
export const INVOICE_QUEUE = "invoice";
export { DECISION_QUEUE };

class UnknownOrderError extends Error {}

type Row = typeof queueMessage.$inferSelect;

const queued = (queue: string): Row[] =>
  db
    .select()
    .from(queueMessage)
    .where(and(eq(queueMessage.queue, queue), eq(queueMessage.status, "queued")))
    .orderBy(asc(queueMessage.id))
    .all();

const markRow = (d: Db, id: number, status: "delivered" | "rejected"): void =>
  void d.update(queueMessage).set({ status }).where(eq(queueMessage.id, id)).run();

/** Writes a document on a named queue inside the caller's transaction. */
const send = (d: Db, queue: string, message: string): void =>
  sendMessage({ queue: databaseQueue(queue, d), message });

/** The order-center view of a stored customer order. */
function centerOrder(o: FulfillmentOrder): CenterOrder {
  const s = o.shipping;
  return {
    id: o.orderId,
    status: o.status ?? "PENDING",
    userId: o.userId ?? undefined,
    orderDate: o.orderDate,
    shippingAddress: s && {
      firstName: s.firstName,
      lastName: s.lastName,
      street: s.address1,
      city: s.city,
      state: s.state,
      country: s.country,
      zipCode: s.postalCode,
      email: s.email,
      phone: s.phone,
    },
    lines: o.lines.map((l) => ({
      category: l.categoryId,
      product: l.productId,
      item: l.itemId,
      lineNumber: l.lineNumber,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      shipped: l.quantityShipped,
    })),
  };
}

/** order-decision: an APPROVED decision becomes a supplier purchase order; DENIED does nothing (R-0018). */
const decisionDelegate: TransitionDelegate = (message) => {
  const row = message as Row;
  db.transaction((tx) => {
    for (const { orderId, orderStatus } of parseApprovalDocument(row.body)) {
      if (orderStatus !== "APPROVED") continue;
      const order = readOrderForFulfillment(tx, orderId);
      if (!order) throw new UnknownOrderError(`Unknown order ${orderId}`);
      sendSupplierPurchaseOrder({
        order: centerOrder(order),
        queue: {
          send: (doc) =>
            send(
              tx,
              SUPPLIER_PURCHASE_ORDER_QUEUE,
              serializeDocument(doc, { type: "SupplierOrder" }),
            ),
        },
      });
    }
    markRow(tx, row.id, "delivered");
  });
};

/** supplier-purchase-order: store the PENDING supplier order, fulfil at once, queue any invoice. */
const supplierOrderDelegate: TransitionDelegate = (message) => {
  const row = message as Row;
  const incoming = parseIncomingOrderXml(row.body);
  withDatabaseStore((store, tx) => {
    if (!loadSupplierOrder(tx, incoming.orderId)) {
      receivePurchaseOrder({
        message: incoming,
        store,
        now: new Date(),
        publish: (invoice) =>
          publishInvoices({
            invoices: [invoice],
            connectionFactory: () => ({
              send: (text) => send(tx, INVOICE_QUEUE, text),
              close() {},
            }),
          }),
      });
    }
    markRow(tx, row.id, "delivered");
  });
};

/** invoice (order center): add shipped quantities, set SHIPPED_PART or COMPLETED, fan out the mail events. */
const invoiceDelegate: TransitionDelegate = (message) => {
  const row = message as Row;
  const invoice = parseInvoiceXml(row.body);
  db.transaction((tx) => {
    const orderId = String(invoice.orderId);
    const stored = readOrderForFulfillment(tx, orderId);
    if (!stored) throw new UnknownOrderError(`Unknown order ${orderId}`);
    const order = centerOrder(stored);
    let completed = false;
    receiveInvoice({ order, invoice, notify: () => void (completed = true) });
    writeShippedQuantities(
      tx,
      orderId,
      order.lines.map((l) => ({ lineNumber: l.lineNumber, shipped: l.shipped })),
    );
    updateOrderStatus(tx, orderId, order.status);
    send(tx, ORDER_STATUS_MAIL_QUEUE, orderEventDocument(orderId, "shipped"));
    if (completed) send(tx, ORDER_STATUS_MAIL_QUEUE, orderEventDocument(orderId, "completed"));
    markRow(tx, row.id, "delivered");
  });
};

const DELEGATES: { queue: string; name: string; delegate: TransitionDelegate }[] = [
  { queue: DECISION_QUEUE, name: "OrderDecisionDelegate", delegate: decisionDelegate },
  {
    queue: SUPPLIER_PURCHASE_ORDER_QUEUE,
    name: "SupplierOrderDelegate",
    delegate: supplierOrderDelegate,
  },
  { queue: INVOICE_QUEUE, name: "InvoiceDelegate", delegate: invoiceDelegate },
];

const permanent = (error: unknown): boolean => {
  const cause = error instanceof TransitionError ? error.cause : error;
  return cause instanceof InvalidDocumentError || cause instanceof UnknownOrderError;
};

/** Handles every queued row of one queue; returns how many were delivered. */
async function drainOne(
  queue: string,
  name: string,
  delegate: TransitionDelegate,
): Promise<number> {
  let delivered = 0;
  for (const row of queued(queue)) {
    try {
      await deliverMessage({ delegateClass: name, registry: { [name]: delegate }, message: row });
      delivered += 1;
    } catch (error) {
      if (permanent(error)) markRow(db, row.id, "rejected");
      // Otherwise it stays queued and is retried on the next drain.
    }
  }
  return delivered;
}

let running = false;
let rerun = false;

/** Applies every queued decision, supplier order and invoice, then the customer mail it fans out. */
export async function drainFulfillmentQueues(): Promise<void> {
  if (running) {
    rerun = true;
    return;
  }
  running = true;
  try {
    let progressed: boolean;
    do {
      rerun = false;
      progressed = false;
      for (const { queue, name, delegate } of DELEGATES) {
        if ((await drainOne(queue, name, delegate)) > 0) progressed = true;
      }
    } while (progressed || rerun);
  } catch {
    // Table not ready or a transient failure: rows are retried on the next drain.
  } finally {
    running = false;
  }
  scheduleStatusMailDrain();
}

export const scheduleFulfillmentDrain = (): void =>
  void setTimeout(() => void drainFulfillmentQueues(), 0);

// Decisions are queued by the approval drain, which this module does not hook into, so also poll.
// Drains run on server start for rows left queued by an earlier run. Tests call the drain directly.
if (!process.env.VITEST) {
  scheduleFulfillmentDrain();
  setInterval(() => void drainFulfillmentQueues(), 1000).unref();
}
