// @vitest-environment node
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "../../../../db/client";
import { inventory, orderStatus, queueMessage, supplierOrders } from "../../../../db/schema";
import { saveInventory } from "../../../../server/admin/inventory";
import { approvalDocument } from "../../../../server/approval/service";
import { DECISION_QUEUE, databaseQueue } from "../../../../server/approval/queue";
import {
  createPurchaseOrderWithDependents,
  getOrderLines,
  getOrderStatus,
} from "../../../../server/checkout/repository";
import { drainFulfillmentQueues } from "../../../../server/fulfillment/queue";

const contact = { firstName: "Al", lastName: "Ice", email: "al@example.com" };
const creditCard = { number: "4111", type: "VISA", expiry: "12/2030" };
const line = (n: number, item: string, quantity: number) => ({
  lineNumber: n,
  category: "FISH",
  product: "FI-SW-01",
  item,
  quantity,
  unitPrice: 5,
});

async function approvedOrder(id: number, lines: ReturnType<typeof line>[]) {
  await createPurchaseOrderWithDependents({ id, contact, creditCard, lines });
  db.insert(orderStatus)
    .values({ orderId: String(id), status: "APPROVED" })
    .run();
  databaseQueue(DECISION_QUEUE).deliver(approvalDocument(String(id), "APPROVED"));
  await drainFulfillmentQueues();
}

const events = (orderId: string) =>
  db
    .select()
    .from(queueMessage)
    .where(eq(queueMessage.queue, "order-status-mail"))
    .all()
    .map((r) => r.body)
    .filter((b) => b.includes(`<OrderId>${orderId}</OrderId>`))
    .map((b) => /<Event>(\w+)<\/Event>/.exec(b)?.[1]);

const stock = (item: string) =>
  db.select().from(inventory).where(eq(inventory.itemId, item)).get()?.quantity;

describe("fulfilment drains", () => {
  it("ships an approved order in full: supplier order COMPLETED, order COMPLETED, completed mail event", async () => {
    const before = stock("EST-1") ?? 0;
    await approvedOrder(9001, [line(1, "EST-1", 2)]);
    expect(await getOrderStatus("9001")).toBe("COMPLETED");
    expect((await getOrderLines("9001"))[0].quantityShipped).toBe(2);
    expect(stock("EST-1")).toBe(before - 2);
    expect(db.select().from(supplierOrders).where(eq(supplierOrders.id, 9001)).get()?.status).toBe(
      "COMPLETED",
    );
    expect(events("9001")).toEqual(["shipped", "completed"]);
  });

  it("a partial shipment sets SHIPPED_PART with no completed event; a stock save ships the rest", async () => {
    db.insert(inventory).values({ itemId: "SCARCE-1", quantity: 0 }).run();
    await approvedOrder(9002, [line(1, "EST-2", 1), line(2, "SCARCE-1", 3)]);
    expect(await getOrderStatus("9002")).toBe("SHIPPED_PART");
    expect(events("9002")).toEqual(["shipped"]);
    expect(db.select().from(supplierOrders).where(eq(supplierOrders.id, 9002)).get()?.status).toBe(
      "PENDING",
    );

    expect(saveInventory({ "SCARCE-1": "5", "EST-3": "-4", "EST-4": "" })).toEqual({
      saved: 1,
      ignored: 2,
    });
    // The waiting order shipped in the same transaction as the save: 5 - 3.
    expect(stock("SCARCE-1")).toBe(2);
    expect(db.select().from(supplierOrders).where(eq(supplierOrders.id, 9002)).get()?.status).toBe(
      "COMPLETED",
    );
    await drainFulfillmentQueues();
    expect(await getOrderStatus("9002")).toBe("COMPLETED");
    expect(events("9002")).toEqual(["shipped", "shipped", "completed"]);
  });

  it("a denied decision starts no supplier order", async () => {
    await createPurchaseOrderWithDependents({
      id: 9003,
      contact,
      creditCard,
      lines: [line(1, "EST-5", 1)],
    });
    databaseQueue(DECISION_QUEUE).deliver(approvalDocument("9003", "DENIED"));
    await drainFulfillmentQueues();
    expect(
      db.select().from(supplierOrders).where(eq(supplierOrders.id, 9003)).get(),
    ).toBeUndefined();
  });
});
