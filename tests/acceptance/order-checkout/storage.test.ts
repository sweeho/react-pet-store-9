// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

// Assumed persistence boundary (Drizzle over bun:sqlite, foreign keys enforced), db/schema.ts holds the
// contact, credit card, purchase order, line item and counter tables.
// server/checkout/repository.ts exports (all async):
//   saveContact({ firstName, lastName, email }) -> { id }
//   saveCreditCard({ cardNumber, cardType, expiryDate }) -> { id }   rejects a missing field or expiry over 10 chars
//   getCreditCard(id) -> { cardNumber, cardType, expiryDate } | undefined
//   savePurchaseOrder({ orderId, userId, email, orderDate: Date, locale, total, contactId, creditCardId,
//                       lines?: line[] }) -> void   rejects an unknown contact or card
//   getPurchaseOrder(orderId) -> { orderId, userId, email, locale, total, ... } | undefined
//   getOrderLines(orderId) -> { lineNumber, ... }[]
//   findPurchaseOrdersByUser(userId) / findPurchaseOrdersByDate(date: Date) -> { orderId, userId, orderDate }[]
//   saveLineItem(line) / saveLineItems(lines) -> void   line = { orderId, lineNumber, categoryId, productId,
//        itemId, quantity, unitPrice, quantityShipped }; rejects quantity <= 0 or quantityShipped > quantity;
//        saveLineItems is all-or-nothing (one transaction); no user or role is needed
//   readLineItem(orderId, lineNumber) -> line | undefined
//   nextIdentifier(prefix) -> string ; getCounter(prefix) -> number | undefined
//   nextOrderNumber() -> number   counter named "1001"; the first call returns 1001
const repo = () => import("../../../server/checkout/repository");

let seq = 0;
const uid = (p: string) => `${p}-${Date.now()}-${++seq}`;
const card = (over: Record<string, unknown> = {}) => ({
  cardNumber: "1234-2334",
  cardType: "Duke Express",
  expiryDate: "10/2001",
  ...over,
});

async function baseOrder(over: Record<string, unknown> = {}) {
  const r = await repo();
  const c = await r.saveContact({ firstName: "Al", lastName: "Ice", email: "al@example.com" });
  const cc = await r.saveCreditCard(card());
  return {
    orderId: uid("o"),
    userId: "alice",
    email: "al@example.com",
    orderDate: new Date(2026, 2, 10),
    locale: "en_US",
    total: 25,
    contactId: c.id,
    creditCardId: cc.id,
    ...over,
  };
}

const line = (orderId: string, over: Record<string, unknown> = {}) => ({
  orderId,
  lineNumber: 0,
  categoryId: "FISH",
  productId: "FI-SW-01",
  itemId: "EST-1",
  quantity: 2,
  unitPrice: 10,
  quantityShipped: 0,
  ...over,
});

describe("purchase order storage", () => {
  // case: SWHR8-C-0154@v1
  it("[SWHR8-C-0154] an order whose card id matches no stored card is refused", async () => {
    const r = await repo();
    const order = await baseOrder({ creditCardId: "no-such-card" });
    await expect(r.savePurchaseOrder(order)).rejects.toThrow();
    expect(await r.getPurchaseOrder(order.orderId)).toBeUndefined();
  });

  // case: SWHR8-C-0155@v1
  it("[SWHR8-C-0155] a complete order is retrievable by its order id", async () => {
    const r = await repo();
    const order = await baseOrder();
    await r.savePurchaseOrder(order);
    const got = await r.getPurchaseOrder(order.orderId);
    expect(got).toMatchObject({
      orderId: order.orderId,
      userId: "alice",
      email: "al@example.com",
      locale: "en_US",
      total: 25,
    });
  });

  // case: SWHR8-C-0173@v1
  it("[SWHR8-C-0173] lookup by user returns only that user's orders", async () => {
    const r = await repo();
    const user = uid("u");
    const mine = await baseOrder({ userId: user });
    const other = await baseOrder({ userId: uid("u") });
    await r.savePurchaseOrder(mine);
    await r.savePurchaseOrder(other);
    const found = await r.findPurchaseOrdersByUser(user);
    expect(found.map((o: { orderId: string }) => o.orderId)).toEqual([mine.orderId]);
  });

  // case: SWHR8-C-0174@v1
  it("[SWHR8-C-0174] lookup by date returns only orders on that date", async () => {
    const r = await repo();
    const day = new Date(2031, 4, 5);
    const on = await baseOrder({ orderDate: day });
    const off = await baseOrder({ orderDate: new Date(2031, 4, 6) });
    await r.savePurchaseOrder(on);
    await r.savePurchaseOrder(off);
    const found = await r.findPurchaseOrdersByDate(day);
    expect(found.map((o: { orderId: string }) => o.orderId)).toEqual([on.orderId]);
  });
});

describe("order line storage", () => {
  // case: SWHR8-C-0177@v1
  it("[SWHR8-C-0177] two lines get their own line numbers under the same order id", async () => {
    const r = await repo();
    const order = await baseOrder();
    await r.savePurchaseOrder({
      ...order,
      lines: [
        line(order.orderId, { lineNumber: 0 }),
        line(order.orderId, { lineNumber: 1, itemId: "EST-6" }),
      ],
    });
    const lines = await r.getOrderLines(order.orderId);
    expect(lines.map((l: { lineNumber: number }) => l.lineNumber).sort()).toEqual([0, 1]);
    expect(lines.every((l: { orderId: string }) => l.orderId === order.orderId)).toBe(true);
  });

  // case: SWHR8-C-0178@v1
  it("[SWHR8-C-0178] a line with quantity 0 is rejected", async () => {
    const r = await repo();
    const order = await baseOrder();
    await r.savePurchaseOrder(order);
    await expect(r.saveLineItem(line(order.orderId, { quantity: 0 }))).rejects.toThrow();
    expect(await r.getOrderLines(order.orderId)).toHaveLength(0);
  });

  // case: SWHR8-C-0179@v1
  it("[SWHR8-C-0179] a line with quantity 2 and quantity shipped 3 is rejected", async () => {
    const r = await repo();
    const order = await baseOrder();
    await r.savePurchaseOrder(order);
    await expect(
      r.saveLineItem(line(order.orderId, { quantity: 2, quantityShipped: 3 })),
    ).rejects.toThrow();
    expect(await r.getOrderLines(order.orderId)).toHaveLength(0);
  });

  // case: SWHR8-C-0161@v1
  it("[SWHR8-C-0161] line item reads and writes need no role", async () => {
    const r = await repo();
    const order = await baseOrder();
    await r.savePurchaseOrder(order);
    // The functions are detached from the module and called with data only: no session, user or role is
    // supplied, and the line is still written and read back. The stored line carries no user or role field.
    const { saveLineItem, readLineItem } = r;
    await saveLineItem(line(order.orderId, { lineNumber: 5 }));
    const stored = await readLineItem(order.orderId, 5);
    expect(stored).toMatchObject({ itemId: "EST-1", quantity: 2 });
    expect(Object.keys(stored as object).filter((k) => /user|role|session/i.test(k))).toEqual([]);
  });

  // case: SWHR8-C-0161@v1
  it("[SWHR8-C-0161] a line item write runs in a transaction: a failing batch leaves nothing behind", async () => {
    const r = await repo();
    const order = await baseOrder();
    await r.savePurchaseOrder(order);
    await expect(
      r.saveLineItems([
        line(order.orderId, { lineNumber: 1 }),
        line(order.orderId, { lineNumber: 2, quantity: 0 }),
      ]),
    ).rejects.toThrow();
    expect(await r.readLineItem(order.orderId, 1)).toBeUndefined();
    expect(await r.getOrderLines(order.orderId)).toHaveLength(0);
  });
});

describe("credit card storage", () => {
  // case: SWHR8-C-0171@v1
  it("[SWHR8-C-0171] a card with no card type is rejected", async () => {
    const r = await repo();
    await expect(r.saveCreditCard(card({ cardType: undefined }))).rejects.toThrow();
  });

  // case: SWHR8-C-0172@v1
  it("[SWHR8-C-0172] a card with a 10-character expiry is accepted", async () => {
    const r = await repo();
    const saved = await r.saveCreditCard(card({ expiryDate: "10/20/2001" }));
    expect((await r.getCreditCard(saved.id))?.expiryDate).toBe("10/20/2001");
  });

  // case: SWHR8-C-0175@v1
  it("[SWHR8-C-0175] a card with no expiry date is rejected as incomplete", async () => {
    const r = await repo();
    await expect(r.saveCreditCard(card({ expiryDate: undefined }))).rejects.toThrow();
  });

  // case: SWHR8-C-0176@v1
  it("[SWHR8-C-0176] a free-text expiry of 04/04 is kept as given", async () => {
    const r = await repo();
    const saved = await r.saveCreditCard(card({ expiryDate: "04/04" }));
    expect((await r.getCreditCard(saved.id))?.expiryDate).toBe("04/04");
  });
});

describe("identifier counters", () => {
  // case: SWHR8-C-0164@v1
  it("[SWHR8-C-0164] each prefix has its own counter with its own last-issued value", async () => {
    const r = await repo();
    const a = uid("A");
    const b = uid("B");
    await r.nextIdentifier(a);
    await r.nextIdentifier(a);
    await r.nextIdentifier(b);
    expect(await r.getCounter(a)).toBe(2);
    expect(await r.getCounter(b)).toBe(1);
  });

  // case: SWHR8-C-0170@v1
  it("[SWHR8-C-0170] the first order number follows the confirmed start value", async () => {
    // Fresh module graph, so a fresh in-memory database (db/client.ts under VITEST): no earlier test or
    // run can have taken an order number from it.
    vi.resetModules();
    const r = await repo();
    const first = await r.nextOrderNumber();
    expect(first).toBe(1001);
    expect(await r.nextOrderNumber()).toBe(1002);
  });
});
