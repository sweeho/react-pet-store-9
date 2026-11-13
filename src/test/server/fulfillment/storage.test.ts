// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed persistence boundary (Drizzle over bun:sqlite, foreign keys enforced), db/schema.ts exports:
//   contacts(id, firstName, lastName, email)
//   supplierOrders(id, orderDate, status, contactId NOT NULL -> contacts.id)
//   supplierLineItems(supplierOrderId NOT NULL -> supplierOrders.id, lineNumber, category, product, item,
//                     quantity, unitPrice NOT NULL)
//   inventory(itemId PRIMARY KEY, quantity CHECK >= 0)
// server/fulfillment/repository.ts exports:
//   saveSupplierOrder(order): Promise<void>; getSupplierOrder(id): Promise<{ id, orderDate, status, contact, lines } | undefined>
//   findSupplierOrdersByStatus(status): Promise<{ id, status }[]>
//   listInventory(): Promise<{ itemId: string; quantity: number }[]>
//   createPurchaseOrderWithDependents({ id, contact, creditCard, lines }): Promise<void>
//   deletePurchaseOrder(id): Promise<void>  (cascades to contact, credit card, line items)
//   findPurchaseOrderDependents(id): Promise<{ contact: unknown; creditCard: unknown; lines: unknown[] }>
const dbm = () => import("../../../../db/client");
const schema = () => import("../../../../db/schema");
const repo = () => import("../../../../server/fulfillment/repository");

async function newContact() {
  const { db } = await dbm();
  const { contacts } = await schema();
  return db
    .insert(contacts)
    .values({ firstName: "Al", lastName: "Ice", email: "al@example.com" })
    .returning()
    .get();
}

const orderRow = (id: number, contactId: number, status = "PENDING") => ({
  id,
  orderDate: new Date(2026, 2, 10),
  status,
  contactId,
});
const lineRow = (supplierOrderId: number, over: Record<string, unknown> = {}) => ({
  supplierOrderId,
  lineNumber: 1,
  category: "FISH",
  product: "P1",
  item: "EST-1",
  quantity: 2,
  unitPrice: 10,
  ...over,
});

describe("order fulfilment storage", () => {
  // case: SWHR8-C-0192@v1
  it("[SWHR8-C-0192] a supplier order referencing a missing contact is rejected", async () => {
    const { db } = await dbm();
    const { supplierOrders } = await schema();
    const c = await newContact();
    db.insert(supplierOrders).values(orderRow(99, c.id)).run(); // control: a valid contact is accepted
    expect(() => db.insert(supplierOrders).values(orderRow(100, 987654)).run()).toThrow();
  });

  // case: SWHR8-C-0193@v1
  it("[SWHR8-C-0193] a line for a non-existent supplier order is rejected", async () => {
    const { db } = await dbm();
    const { supplierOrders, supplierLineItems } = await schema();
    const c = await newContact();
    db.insert(supplierOrders).values(orderRow(98, c.id)).run();
    db.insert(supplierLineItems).values(lineRow(98)).run(); // control: a line for an existing order is accepted
    expect(() => db.insert(supplierLineItems).values(lineRow(424242)).run()).toThrow();
  });

  // case: SWHR8-C-0200@v1
  it("[SWHR8-C-0200] only one quantity exists for an item when a second is recorded", async () => {
    const { db } = await dbm();
    const { inventory } = await schema();
    db.insert(inventory).values({ itemId: "DUP-1", quantity: 5 }).run();
    try {
      db.insert(inventory).values({ itemId: "DUP-1", quantity: 9 }).run();
    } catch {
      // a rejected duplicate is one valid way to keep a single quantity
    }
    const rows = db
      .select()
      .from(inventory)
      .all()
      .filter((r) => r.itemId === "DUP-1");
    expect(rows).toHaveLength(1);
  });

  // case: SWHR8-C-0207@v1
  it("[SWHR8-C-0207] listing inventory shows each item once with its quantity on hand", async () => {
    const { db } = await dbm();
    const { inventory } = await schema();
    db.insert(inventory)
      .values([
        { itemId: "L-1", quantity: 1 },
        { itemId: "L-2", quantity: 2 },
        { itemId: "L-3", quantity: 3 },
      ])
      .run();
    const { listInventory } = await repo();
    const items = (await listInventory()).filter((r) => r.itemId.startsWith("L-"));
    expect(items.map((r) => [r.itemId, r.quantity]).sort()).toEqual([
      ["L-1", 1],
      ["L-2", 2],
      ["L-3", 3],
    ]);
  });

  // case: SWHR8-C-0211@v1
  it("[SWHR8-C-0211] deleting a purchase order deletes its contact, credit card and line items", async () => {
    const r = await repo();
    await r.createPurchaseOrderWithDependents({
      id: 500,
      contact: { firstName: "Al", lastName: "Ice", email: "al@example.com" },
      creditCard: { number: "4111111111111111", type: "VISA", expiry: "12/2030" },
      lines: [lineRow(500), lineRow(500, { lineNumber: 2 })],
    });
    const before = await r.findPurchaseOrderDependents(500);
    expect(before.lines).toHaveLength(2);
    await r.deletePurchaseOrder(500);
    const after = await r.findPurchaseOrderDependents(500);
    expect(after.contact).toBeFalsy();
    expect(after.creditCard).toBeFalsy();
    expect(after.lines).toHaveLength(0);
  });

  // case: SWHR8-C-0212@v1
  it("[SWHR8-C-0212] requesting supplier orders by status PENDING returns only the pending ones", async () => {
    const { db } = await dbm();
    const { supplierOrders } = await schema();
    const c = await newContact();
    db.insert(supplierOrders)
      .values([
        orderRow(601, c.id, "PENDING"),
        orderRow(602, c.id, "COMPLETED"),
        orderRow(603, c.id, "PENDING"),
      ])
      .run();
    const { findSupplierOrdersByStatus } = await repo();
    const found = (await findSupplierOrdersByStatus("PENDING")).filter((o) =>
      [601, 602, 603].includes(o.id),
    );
    expect(found.map((o) => o.id).sort()).toEqual([601, 603]);
    expect(found.every((o) => o.status === "PENDING")).toBe(true);
  });

  // case: SWHR8-C-0222@v1
  it("[SWHR8-C-0222] a stock quantity of -1 is rejected", async () => {
    const { db } = await dbm();
    const { inventory } = await schema();
    db.insert(inventory).values({ itemId: "POS-1", quantity: 0 }).run(); // control: zero is accepted
    expect(() => db.insert(inventory).values({ itemId: "NEG-1", quantity: -1 }).run()).toThrow();
  });

  // case: SWHR8-C-0224@v1
  it("[SWHR8-C-0224] a stored supplier purchase order keeps id, date, status, one contact and its line items", async () => {
    const r = await repo();
    await r.saveSupplierOrder({
      id: 700,
      orderDate: new Date(2026, 2, 10),
      status: "PENDING",
      contact: { firstName: "Al", lastName: "Ice", email: "al@example.com" },
      lines: [lineRow(700), lineRow(700, { lineNumber: 2 })],
    });
    const got = await r.getSupplierOrder(700);
    expect(got?.id).toBe(700);
    expect(got?.status).toBe("PENDING");
    expect(got?.orderDate).toEqual(new Date(2026, 2, 10));
    expect(got?.contact).toMatchObject({ firstName: "Al", lastName: "Ice" });
    expect(got?.lines).toHaveLength(2);
  });

  // case: SWHR8-C-0227@v1
  it("[SWHR8-C-0227] a line without a unit price is rejected", async () => {
    const { db } = await dbm();
    const { supplierOrders, supplierLineItems } = await schema();
    const c = await newContact();
    db.insert(supplierOrders).values(orderRow(800, c.id)).run();
    db.insert(supplierLineItems).values(lineRow(800)).run(); // control: a priced line is accepted
    expect(() =>
      db
        .insert(supplierLineItems)
        .values(lineRow(800, { lineNumber: 2, unitPrice: undefined }))
        .run(),
    ).toThrow();
  });
});
