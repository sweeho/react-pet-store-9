// Database outbox queues for order approval (change swhr8-i-0008, design P2-P4).
import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/client";
import { queueMessage } from "../../db/schema";
import { statusRecords, type Db } from "../checkout/repository";
import {
  approvalDocument,
  handleDecision,
  parseApprovalDocument,
  sendMessage,
  type MessageQueue,
} from "./service";

export const APPROVAL_QUEUE = "order-approval";
export const DECISION_QUEUE = "order-decision";

/** A named queue backed by `queue_message`; bound to a transaction, a row commits or rolls back with it. */
export function databaseQueue(name: string, d: Db = db): MessageQueue {
  return {
    deliver(text: string): void {
      d.insert(queueMessage)
        .values({ queue: name, body: text, status: "queued", createdAt: new Date() })
        .run();
    },
  };
}

/** Puts an APPROVED OrderApproval document on the approval queue, inside the caller's transaction. */
export function enqueueApproval(d: Db, orderId: string): void {
  sendMessage({
    queue: databaseQueue(APPROVAL_QUEUE, d),
    message: approvalDocument(orderId, "APPROVED"),
  });
}

let running = false;
let rerun = false;

/** Applies every queued decision; a failed row rolls back and stays queued for the next drain. */
export function drainApprovalQueue(): Promise<void> {
  if (running) {
    // A message queued mid-drain is missed by that drain's snapshot; ask it to go round again.
    rerun = true;
    return Promise.resolve();
  }
  running = true;
  try {
    do {
      rerun = false;
      drainOnce();
    } while (rerun);
  } catch {
    // Table not ready or a transient failure: queued rows are retried on the next drain.
  } finally {
    running = false;
  }
  return Promise.resolve();
}

function drainOnce(): void {
  const rows = db
    .select()
    .from(queueMessage)
    .where(and(eq(queueMessage.queue, APPROVAL_QUEUE), eq(queueMessage.status, "queued")))
    .orderBy(asc(queueMessage.id))
    .all();
  for (const row of rows) {
    try {
      db.transaction((tx) => {
        const store = { records: statusRecords(tx) };
        const queue = databaseQueue(DECISION_QUEUE, tx);
        for (const { orderId, orderStatus } of parseApprovalDocument(row.body)) {
          if (orderStatus !== "APPROVED" && orderStatus !== "DENIED") {
            throw new Error(`Not a decision: ${orderStatus}`);
          }
          handleDecision({
            store,
            orderId,
            decision: orderStatus,
            send: (message) => sendMessage({ queue, message }),
          });
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
}

export const scheduleApprovalDrain = (): void =>
  void setTimeout(() => void drainApprovalQueue(), 0);

// A drain also runs on server start, for decisions left queued by an earlier run.
scheduleApprovalDrain();
