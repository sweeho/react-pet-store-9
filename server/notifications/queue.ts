// Drains for customer notifications (change swhr8-i-0009, design N7-N8).
import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/client";
import { queueMessage } from "../../db/schema";
import { databaseQueue } from "../approval/queue";
import { parseApprovalDocument, sendMessage } from "../approval/service";
import { getPurchaseOrder } from "../checkout/repository";
import { parseXml } from "../checkout/xml";
import { escapeXml, processMailRequest, type OutgoingMail } from "./mailer";
import {
  MAIL_QUEUE,
  notificationSettings,
  notifyOrderEvent,
  ORDER_EVENTS,
  ORDER_STATUS_MAIL_QUEUE,
  type OrderEvent,
} from "./order-mail";
import { mailSender, smtpTransport } from "./transport";

/** Reads an OrderEvent document, or an OrderApproval document (approved or denied). */
function parseEvents(body: string): { orderId: string; event: OrderEvent }[] {
  if (body.includes("<OrderApproval")) {
    return parseApprovalDocument(body).map((d) => {
      if (d.orderStatus !== "APPROVED" && d.orderStatus !== "DENIED") {
        throw new Error(`Not a decision: ${d.orderStatus}`);
      }
      return { orderId: d.orderId, event: d.orderStatus === "APPROVED" ? "approved" : "denied" };
    });
  }
  const root = parseXml(body);
  const orderId = root.children.find((c) => c.name === "OrderId")?.text.trim() ?? "";
  const event = root.children.find((c) => c.name === "Event")?.text.trim() ?? "";
  if (
    root.name !== "OrderEvent" ||
    !orderId ||
    !(ORDER_EVENTS as readonly string[]).includes(event)
  ) {
    throw new Error("Invalid order event");
  }
  return [{ orderId, event: event as OrderEvent }];
}

const mailDocument = (m: OutgoingMail): string =>
  `<?xml version="1.0"?><Mail><Address>${escapeXml(m.to.join(","))}</Address>` +
  `<Subject>${escapeXml(m.subject)}</Subject><Content>${m.body}</Content></Mail>`;

const queued = (queue: string) =>
  db
    .select()
    .from(queueMessage)
    .where(and(eq(queueMessage.queue, queue), eq(queueMessage.status, "queued")))
    .orderBy(asc(queueMessage.id))
    .all();

const markDelivered = (id: number): void =>
  void db.update(queueMessage).set({ status: "delivered" }).where(eq(queueMessage.id, id)).run();

/** Turns each order event into Mail documents on the `mail` queue; a failed row stays queued. */
async function drainStatusMailOnce(): Promise<void> {
  for (const row of queued(ORDER_STATUS_MAIL_QUEUE)) {
    try {
      const mails: OutgoingMail[] = [];
      for (const { orderId, event } of parseEvents(row.body)) {
        const order = await getPurchaseOrder(orderId);
        if (!order) throw new Error(`Unknown order ${orderId}`);
        await notifyOrderEvent({
          event,
          order,
          settings: notificationSettings(),
          sender: mailSender(),
          transport: { send: async (m) => void mails.push(m) },
        });
      }
      db.transaction((tx) => {
        for (const m of mails) {
          sendMessage({ queue: databaseQueue(MAIL_QUEUE, tx), message: mailDocument(m) });
        }
        tx.update(queueMessage)
          .set({ status: "delivered" })
          .where(eq(queueMessage.id, row.id))
          .run();
      });
    } catch {
      // Stays queued; retried on the next drain.
    }
  }
  if (queued(MAIL_QUEUE).length) scheduleMailDrain();
}

/** Sends each Mail document. A delivery failure is logged and consumed; a malformed one stays queued. */
async function drainMailOnce(): Promise<void> {
  for (const row of queued(MAIL_QUEUE)) {
    try {
      await processMailRequest({
        message: row.body,
        transport: smtpTransport(),
        log: { error: (...a) => console.error(...a) },
        sender: mailSender(),
      });
      markDelivered(row.id);
    } catch {
      // Processing error: not handled, stays queued.
    }
  }
}

function guarded(run: () => Promise<void>): () => Promise<void> {
  let running = false;
  let rerun = false;
  return async () => {
    if (running) {
      rerun = true;
      return;
    }
    running = true;
    try {
      do {
        rerun = false;
        await run();
      } while (rerun);
    } catch {
      // Table not ready or a transient failure: rows are retried on the next drain.
    } finally {
      running = false;
    }
  };
}

export const drainStatusMailQueue = guarded(drainStatusMailOnce);
export const drainMailQueue = guarded(drainMailOnce);

export const scheduleStatusMailDrain = (): void =>
  void setTimeout(() => void drainStatusMailQueue(), 0);
export const scheduleMailDrain = (): void => void setTimeout(() => void drainMailQueue(), 0);

// Drains also run on server start, for rows left queued by an earlier run.
scheduleStatusMailDrain();
scheduleMailDrain();
