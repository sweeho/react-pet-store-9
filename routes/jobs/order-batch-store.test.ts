import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "../../db/client";
import {
  contacts,
  orderContact,
  orderCreditCard,
  orderLineItem,
  orderStatus,
  purchaseOrder,
  supplierLineItems,
  supplierOrders,
} from "../../db/schema";
import { listBatchOrders } from "../../server/checkout/repository";
import { listSupplierOrderStatuses } from "../../server/fulfillment/repository";
import { purgeOrdersInDb } from "../../server/jobs/order-batch-store";

const now = new Date(2026, 2, 22, 2, 0);
const DAY = 86_400_000;

function seed(id: number, ageDays: number, status: string, withStatus = true): void {
  const contact = db.insert(orderContact).values({ firstName: "A" }).returning().get();
  const card = db
    .insert(orderCreditCard)
    .values({ cardNumber: "4111", cardType: "VISA", expiryDate: "12/30" })
    .returning()
    .get();
  db.insert(purchaseOrder)
    .values({
      orderId: String(id),
      userId: "alice",
      orderDate: new Date(now.getTime() - ageDays * DAY),
      locale: "en_US",
      total: 10,
      billContactId: contact.id,
      shipContactId: contact.id,
      creditCardId: card.id,
    })
    .run();
  if (withStatus)
    db.insert(orderStatus)
      .values({ orderId: String(id), status })
      .run();
  db.insert(orderLineItem)
    .values({
      orderId: String(id),
      lineNumber: 1,
      categoryId: "c",
      productId: "p",
      itemId: "i",
      quantity: 1,
      unitPrice: 10,
      quantityShipped: 0,
    })
    .run();
  const sc = db.insert(contacts).values({ firstName: "S" }).returning().get();
  db.insert(supplierOrders)
    .values({ id, orderDate: new Date(), status: "COMPLETED", contactId: sc.id })
    .run();
  db.insert(supplierLineItems)
    .values({
      supplierOrderId: id,
      lineNumber: 1,
      category: "c",
      product: "p",
      item: "i",
      quantity: 1,
      unitPrice: 10,
    })
    .run();
}

describe("order batch store", () => {
  it("lists orders with status and line count, and supplier statuses by order id", () => {
    seed(9001, 1, "APPROVED");
    seed(9002, 1, "x", false);
    const orders = listBatchOrders(db).filter((o) => o.orderId.startsWith("900"));
    expect(orders.map((o) => [o.orderId, o.status, o.lineCount, o.userName])).toEqual([
      ["9001", "APPROVED", 1, "alice"],
      ["9002", "UNKNOWN", 1, "alice"],
    ]);
    expect(listSupplierOrderStatuses(db)).toContainEqual({ orderId: "9001", status: "COMPLETED" });
  });

  it("[SWHR8-C-0133] purges old finished orders with all dependents in one transaction, keeps the rest", () => {
    seed(8001, 200, "COMPLETED");
    seed(8002, 200, "DENIED");
    seed(8003, 400, "PENDING");
    seed(8004, 10, "COMPLETED");

    const result = purgeOrdersInDb(now, 180);

    expect(result.purgedOrderIds.sort()).toEqual(["8001", "8002"]);
    expect(result.transactions).toBe(1);
    const left = db
      .select()
      .from(purchaseOrder)
      .all()
      .map((o) => o.orderId);
    expect(left).toContain("8003");
    expect(left).toContain("8004");
    expect(left).not.toContain("8001");
    expect(db.select().from(orderLineItem).where(eq(orderLineItem.orderId, "8001")).all()).toEqual(
      [],
    );
    expect(db.select().from(supplierOrders).where(eq(supplierOrders.id, 8001)).all()).toEqual([]);
    expect(
      db.select().from(supplierLineItems).where(eq(supplierLineItems.supplierOrderId, 8002)).all(),
    ).toEqual([]);
    // 8003 and 8004 keep their contacts and cards; 8001 and 8002 lost theirs.
    expect(db.select().from(orderCreditCard).all()).toHaveLength(
      db.select().from(purchaseOrder).all().length,
    );
  });
});
