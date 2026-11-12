// @vitest-environment node
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "../../../../db/client";
import { queueMessage } from "../../../../db/schema";
import { drainApprovalQueue } from "../../../../server/approval/queue";
import {
  getOrderStatus,
  listOrderStatusRows,
  updateOrderStatus,
} from "../../../../server/checkout/repository";
import { placeOrder, receiveOrderMessage } from "../../../../server/checkout/service";

const checkoutInput = (locale: string, price: number) => ({
  userId: "alice",
  locale,
  cart: [
    { categoryId: "FISH", productId: "FI-SW-01", itemId: "EST-1", quantity: 1, unitCost: price },
  ],
  billing: contact(),
  shipping: contact(),
});
const contact = () => ({
  lastName: "Ice",
  firstName: "Al",
  address1: "1 Main",
  city: "Town",
  state: "CA",
  postalCode: "90000",
  phone: "555",
});

async function receive(locale: string, price: number): Promise<string> {
  const delivered: string[] = [];
  const order = await placeOrder({
    ...checkoutInput(locale, price),
    queue: { deliver: (t) => void delivered.push(t) },
  });
  await receiveOrderMessage(delivered[0]);
  return String(order.orderId);
}

const rows = (queue: string) =>
  db.select().from(queueMessage).where(eq(queueMessage.queue, queue)).all();

describe("approval queue", () => {
  it("approves an under-limit en_US order through the queue drain", async () => {
    const id = await receive("en_US", 25);
    expect(await getOrderStatus(id)).toBe("PENDING");
    await drainApprovalQueue();
    expect(await getOrderStatus(id)).toBe("APPROVED");
    expect(rows("order-decision").some((r) => r.body.includes(`<OrderId>${id}</OrderId>`))).toBe(
      true,
    );
  });

  it("keeps a zh_CN order PENDING and enqueues nothing for it", async () => {
    const before = rows("order-approval").length;
    const id = await receive("zh_CN", 1);
    await drainApprovalQueue();
    expect(await getOrderStatus(id)).toBe("PENDING");
    expect(rows("order-approval").length).toBe(before);
  });

  it("lists orders with a status record", async () => {
    const id = await receive("de_DE", 10);
    expect(listOrderStatusRows(db).find((r) => r.orderId === id)).toMatchObject({
      status: "PENDING",
    });
  });

  it("repository refuses an unknown order and a bad status", () => {
    expect(() => updateOrderStatus(db, "nope", "APPROVED")).toThrow(/No status record/);
    expect(() => updateOrderStatus(db, "nope", "BOGUS")).toThrow(/Unrecognised/);
  });

  it("a rolled-back transaction leaves no order-decision row", async () => {
    const before = rows("order-decision").length;
    expect(() =>
      db.transaction((tx) => {
        tx.insert(queueMessage)
          .values({ queue: "order-decision", body: "x", status: "queued", createdAt: new Date() })
          .run();
        updateOrderStatus(tx, "nope", "APPROVED");
      }),
    ).toThrow();
    expect(rows("order-decision").length).toBe(before);
  });
});
