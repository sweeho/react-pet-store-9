// @vitest-environment node
import { describe, expect, it } from "vitest";
// Shared fixtures for the order-checkout acceptance tests.
export type FakeQueue = { delivered: string[]; deliver: (text: string) => void };
export const fakeQueue = (): FakeQueue => {
  const q: FakeQueue = {
    delivered: [],
    deliver(text) {
      q.delivered.push(text);
    },
  };
  return q;
};

export const contact = (over: Record<string, string> = {}) => ({
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  phone: "555-0100",
  email: "jane@example.com",
  ...over,
});

export const cart = () => [
  { categoryId: "FISH", productId: "FI-SW-01", itemId: "EST-1", quantity: 2, unitCost: 10 },
  { categoryId: "DOGS", productId: "K9-BD-01", itemId: "EST-6", quantity: 1, unitCost: 5 },
];

export const checkoutInput = (over: Record<string, unknown> = {}) => ({
  userId: "alice",
  locale: "en_US",
  cart: cart(),
  billing: contact(),
  shipping: contact(),
  ...over,
});

// Assumed module boundary: server/checkout/service.ts exports
//   placeOrder({ userId, email?, locale, cart, billing, shipping, queue, now? }) -> Promise<order>
//     validates the contact data (rejects with an Error naming the missing fields, queues nothing),
//     draws the order number from the "1001" counter, totals the cart, stamps user, bill-to e-mail
//     (billing.email), time, billing/shipping contacts, locale and the FIXED card, then sends the XML
//     purchase order to queue.deliver(text). order = { orderId, userId, email, orderDate, locale, total,
//     billing, shipping, creditCard: { cardNumber, cardType, expiryDate }, lines }
//   receiveOrderMessage(xml) -> Promise<void>  stores the order with tracking status PENDING
//   getOrderTrackingStatus(orderId) -> Promise<string | undefined>
// server/checkout/repository.ts: getPurchaseOrder(orderId), saveCreditCard, getCreditCard as in storage.test.ts
const svc = () => import("../../../../server/checkout/service");
const repo = () => import("../../../../server/checkout/repository");

describe("contact data validation", () => {
  // case: SWHR8-C-0158@v1
  it("[SWHR8-C-0158] an empty billing postal code blocks the order", async () => {
    const { placeOrder } = await svc();
    const queue = fakeQueue();
    await expect(
      placeOrder({ ...checkoutInput({ billing: contact({ postalCode: "" }) }), queue }),
    ).rejects.toThrow();
    expect(queue.delivered).toHaveLength(0);
  });

  // case: SWHR8-C-0159@v1
  it("[SWHR8-C-0159] an order with every contact field present is accepted", async () => {
    const { placeOrder } = await svc();
    const queue = fakeQueue();
    const order = await placeOrder({ ...checkoutInput(), queue });
    expect(order.orderId).toBeTruthy();
    expect(queue.delivered).toHaveLength(1);
  });
});

describe("order placement", () => {
  // case: SWHR8-C-0166@v1
  it("[SWHR8-C-0166] the order carries the fixed card, not the account's card", async () => {
    const { placeOrder } = await svc();
    const order = await placeOrder({
      ...checkoutInput({
        accountCard: { cardNumber: "9999-0000", cardType: "Visa", expiryDate: "01/2030" },
      }),
      queue: fakeQueue(),
    });
    expect(order.creditCard).toEqual({
      cardNumber: "1234-2334",
      cardType: "Duke Express",
      expiryDate: "10/2001",
    });
  });

  // case: SWHR8-C-0184@v1
  it("[SWHR8-C-0184] a placed order gets a new number and carries user, e-mail, time, contacts, card and locale", async () => {
    const { placeOrder } = await svc();
    const before = Date.now();
    const first = await placeOrder({ ...checkoutInput(), queue: fakeQueue() });
    const second = await placeOrder({ ...checkoutInput(), queue: fakeQueue() });
    expect(String(first.orderId)).not.toBe(String(second.orderId));
    expect(first).toMatchObject({
      userId: "alice",
      email: "jane@example.com",
      locale: "en_US",
      billing: { city: "Springfield" },
      shipping: { city: "Springfield" },
    });
    expect(first.creditCard.cardNumber).toBeTruthy();
    expect(new Date(first.orderDate).getTime()).toBeGreaterThanOrEqual(before - 1000);
  });
});

describe("order receipt", () => {
  // case: SWHR8-C-0160@v1
  it("[SWHR8-C-0160] a queued order message is stored with tracking status PENDING", async () => {
    const { placeOrder, receiveOrderMessage, getOrderTrackingStatus } = await svc();
    const { getPurchaseOrder } = await repo();
    const queue = fakeQueue();
    const order = await placeOrder({ ...checkoutInput(), queue });
    await receiveOrderMessage(queue.delivered[0]);
    expect(await getPurchaseOrder(String(order.orderId))).toMatchObject({ userId: "alice" });
    expect(await getOrderTrackingStatus(String(order.orderId))).toBe("PENDING");
  });
});

describe("empty cart", () => {
  it("[SWHR8-C-0082] submitting with an empty cart is rejected and nothing is queued", async () => {
    const { placeOrder } = await svc();
    const queue = fakeQueue();
    await expect(placeOrder({ ...checkoutInput({ cart: [] }), queue })).rejects.toThrow(/empty/i);
    expect(queue.delivered).toHaveLength(0);
  });
});
