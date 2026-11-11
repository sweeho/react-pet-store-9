// In-process transactional outbox to order processing (change swhr8-i-0007, design O8).
import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/client";
import { orderMessage } from "../../db/schema";
import { receiveOrderMessage, type OrderQueue } from "./service";
import { parseOrderXml } from "./xml";

let draining: Promise<void> | undefined;
let rerun = false;

/** Delivers every queued message; a failed receipt leaves its row queued for the next drain. */
export function drainOrderQueue(): Promise<void> {
  if (draining) {
    // A message queued mid-drain is missed by that drain's snapshot; ask it to go round again.
    rerun = true;
    return draining;
  }
  draining = (async () => {
    try {
      do {
        rerun = false;
        await drainOnce();
      } while (rerun);
    } catch {
      // Table not ready or a transient failure: queued rows are retried on the next drain.
    } finally {
      draining = undefined;
    }
  })();
  return draining;
}

async function drainOnce(): Promise<void> {
  const rows = db
    .select()
    .from(orderMessage)
    .where(eq(orderMessage.status, "queued"))
    .orderBy(asc(orderMessage.id))
    .all();
  for (const row of rows) {
    try {
      await receiveOrderMessage(row.body);
      db.update(orderMessage)
        .set({ status: "delivered" })
        .where(and(eq(orderMessage.id, row.id), eq(orderMessage.status, "queued")))
        .run();
    } catch {
      // Stays queued; retried on the next drain.
    }
  }
}

const scheduleDrain = (): void => void setTimeout(() => void drainOrderQueue(), 0);

/** The queue a session's orders are handed to. */
export function orderQueue(sessionId?: string): OrderQueue {
  return {
    deliver(text: string): void {
      db.insert(orderMessage)
        .values({
          orderId: parseOrderXml(text).orderId,
          body: text,
          status: "queued",
          sessionId: sessionId ?? null,
          createdAt: new Date(),
        })
        .run();
      scheduleDrain();
    },
  };
}

/** The XML bodies queued by one session, oldest first. */
export function messagesFor(sessionId: string): string[] {
  return db
    .select({ body: orderMessage.body })
    .from(orderMessage)
    .where(eq(orderMessage.sessionId, sessionId))
    .orderBy(asc(orderMessage.id))
    .all()
    .map((r) => r.body);
}

// A drain also runs on server start, for messages left queued by an earlier run.
scheduleDrain();
