// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  approvalXml,
  fakeQueue,
  fakeTransaction,
  statusStore,
} from "../../../../tests/acceptance/order-approval/helpers";

// Assumed module boundary: server/approval/service.ts exports
//   isRecognisedStatus(name): boolean                 PENDING, APPROVED, DENIED, SHIPPED_PART, COMPLETED
//   createStatusRecord({ store, orderId, status }): { orderId, status }   store = { records: Map<orderId, { orderId, status }> }
//   getStatus({ store, orderId }): string             throws error named "NotFoundError" when no record
//   updateStatus({ store, orderId, status }): void    throws "NotFoundError" when no record; throws for a
//                                                     status outside PENDING, APPROVED, DENIED, COMPLETED
//   findOrdersByStatus({ store, status }): { orderId, status }[]
//   listOrderStatuses({ purchaseOrders, store }): { orderId, userId, date, value, status }[]
//     purchaseOrders: { orderId, userId, orderDate: Date, value }[]; only orders with a status record
//   parseApprovalDocument(xml): { orderId, orderStatus }[]   throws an Error on invalid documents
//   createOrderMessage({ orderId, total, locale }): { orderId, total, locale }
//   evaluateOrder({ total, locale }): "APPROVED" | "PENDING"   locales "en_US", "ja_JP", "zh_CN"
//   receiveOrder({ store, order: { orderId, total, locale } }): void   creates the status record with the evaluated status
//   handleDecision({ store, orderId, decision: "APPROVED" | "DENIED", send }): void
//     ignores non-PENDING orders (no change, send not called); otherwise records status
//   sendMessage({ queue, message, transaction? }): void
//     queue = { deliver(text) } (throws when unavailable); transaction = { enlist(fn) }, fn delivers on commit
const svc = () => import("../../../../server/approval/service");

const po = (orderId: string) => ({
  orderId,
  userId: "alice",
  orderDate: new Date(2026, 2, 10),
  value: 75.5,
});

describe("order status listing", () => {
  // case: SWHR8-C-0085@v1
  it("[SWHR8-C-0085] an order without a status record does not appear in the listing", async () => {
    const { listOrderStatuses } = await svc();
    const rows = listOrderStatuses({
      purchaseOrders: [po("1"), po("2")],
      store: statusStore({ "2": "PENDING" }),
    });
    expect(rows.map((r: { orderId: string }) => r.orderId)).toEqual(["2"]);
  });

  // case: SWHR8-C-0086@v1
  it("[SWHR8-C-0086] an order with a status record is listed with id, user, date, value and status", async () => {
    const { listOrderStatuses } = await svc();
    const rows = listOrderStatuses({
      purchaseOrders: [po("7")],
      store: statusStore({ "7": "APPROVED" }),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      orderId: "7",
      userId: "alice",
      value: 75.5,
      status: "APPROVED",
    });
    expect(rows[0].date).toBeDefined();
  });
});

describe("status records", () => {
  // case: SWHR8-C-0087@v1
  it("[SWHR8-C-0087] lookup by PENDING returns only the pending orders", async () => {
    const { findOrdersByStatus } = await svc();
    const store = statusStore({
      "1": "PENDING",
      "2": "APPROVED",
      "3": "DENIED",
      "4": "COMPLETED",
      "5": "PENDING",
    });
    const found = findOrdersByStatus({ store, status: "PENDING" });
    expect(found.map((o: { orderId: string }) => o.orderId).sort()).toEqual(["1", "5"]);
  });

  // case: SWHR8-C-0088@v1
  it("[SWHR8-C-0088] the status name SHIPPED_PART is accepted", async () => {
    const { isRecognisedStatus } = await svc();
    expect(isRecognisedStatus("SHIPPED_PART")).toBe(true);
  });

  // case: SWHR8-C-0089@v1
  it("[SWHR8-C-0089] a new order's status record created with PENDING reads back as PENDING", async () => {
    const { createStatusRecord, getStatus } = await svc();
    const store = statusStore();
    createStatusRecord({ store, orderId: "10", status: "PENDING" });
    expect(getStatus({ store, orderId: "10" })).toBe("PENDING");
  });

  // case: SWHR8-C-0090@v1
  it("[SWHR8-C-0090] reading or updating the status of an unknown order raises not-found", async () => {
    const { getStatus, updateStatus } = await svc();
    const store = statusStore();
    const notFound = expect.objectContaining({ name: "NotFoundError" });
    expect(() => getStatus({ store, orderId: "404" })).toThrowError(notFound);
    expect(() => updateStatus({ store, orderId: "404", status: "APPROVED" })).toThrowError(
      notFound,
    );
  });

  // case: SWHR8-C-0098@v1
  it("[SWHR8-C-0098] a status outside the vocabulary is refused and the four valid values are accepted", async () => {
    const { updateStatus, getStatus } = await svc();
    const store = statusStore({ "20": "PENDING" });
    expect(() => updateStatus({ store, orderId: "20", status: "BOGUS" })).toThrow();
    expect(getStatus({ store, orderId: "20" })).toBe("PENDING");
    for (const status of ["PENDING", "APPROVED", "DENIED", "COMPLETED"]) {
      updateStatus({ store, orderId: "20", status });
      expect(getStatus({ store, orderId: "20" })).toBe(status);
    }
  });

  // case: SWHR8-C-0099@v1
  it("[SWHR8-C-0099] an order has exactly one status record identified by its order id", async () => {
    const { createStatusRecord, findOrdersByStatus, getStatus } = await svc();
    const store = statusStore({ "31": "APPROVED" });
    createStatusRecord({ store, orderId: "30", status: "PENDING" });
    try {
      createStatusRecord({ store, orderId: "30", status: "APPROVED" });
    } catch {
      // refusing the second record is an acceptable way to keep one record per order
    }
    const all = ["PENDING", "APPROVED", "DENIED", "COMPLETED"].flatMap((status) =>
      findOrdersByStatus({ store, status }),
    );
    const forOrder = all.filter((r: { orderId: string }) => r.orderId === "30");
    expect(forOrder).toHaveLength(1);
    expect(getStatus({ store, orderId: "30" })).toBe(forOrder[0].status);
    expect(all).toHaveLength(2);
  });
});

describe("approval document validation", () => {
  // case: SWHR8-C-0091@v1
  it("[SWHR8-C-0091] a non-Order element is rejected with an error stating an Order element is expected", async () => {
    const { parseApprovalDocument } = await svc();
    const xml = approvalXml("<Item><OrderId>1</OrderId><OrderStatus>APPROVED</OrderStatus></Item>");
    expect(() => parseApprovalDocument(xml)).toThrowError(/Order element/i);
  });

  // case: SWHR8-C-0092@v1
  it("[SWHR8-C-0092] an Order with OrderStatus before OrderId is rejected", async () => {
    const { parseApprovalDocument } = await svc();
    const xml = approvalXml(
      "<Order><OrderStatus>APPROVED</OrderStatus><OrderId>1</OrderId></Order>",
    );
    expect(() => parseApprovalDocument(xml)).toThrow();
  });
});

describe("decisions", () => {
  // case: SWHR8-C-0093@v1
  it("[SWHR8-C-0093] an approval message for a COMPLETED order changes nothing and sends nothing", async () => {
    const { handleDecision, getStatus } = await svc();
    const store = statusStore({ "40": "COMPLETED" });
    const send = vi.fn();
    handleDecision({ store, orderId: "40", decision: "APPROVED", send });
    expect(getStatus({ store, orderId: "40" })).toBe("COMPLETED");
    expect(send).not.toHaveBeenCalled();
  });

  // case: SWHR8-C-0094@v1
  it("[SWHR8-C-0094] a denial message for a PENDING order sets it to DENIED", async () => {
    const { handleDecision, getStatus } = await svc();
    const store = statusStore({ "41": "PENDING" });
    handleDecision({ store, orderId: "41", decision: "DENIED", send: vi.fn() });
    expect(getStatus({ store, orderId: "41" })).toBe("DENIED");
  });
});

describe("asynchronous send", () => {
  // case: SWHR8-C-0095@v1
  it("[SWHR8-C-0095] sending to an unavailable queue raises an error to the caller", async () => {
    const { sendMessage } = await svc();
    const queue = fakeQueue(false);
    expect(() => sendMessage({ queue, message: "<OrderApproval/>" })).toThrow();
    expect(queue.delivered).toEqual([]);
  });

  // case: SWHR8-C-0096@v1
  it("[SWHR8-C-0096] a message sent inside a rolled-back transaction is not delivered", async () => {
    const { sendMessage } = await svc();
    const queue = fakeQueue();
    const transaction = fakeTransaction();
    sendMessage({ queue, message: "<OrderApproval/>", transaction });
    transaction.rollback();
    transaction.commit();
    expect(queue.delivered).toEqual([]);
  });

  // case: SWHR8-C-0097@v1
  it("[SWHR8-C-0097] an approval XML message is published as one text message on the configured queue", async () => {
    const { sendMessage } = await svc();
    const queue = fakeQueue();
    const message = approvalXml(
      "<Order><OrderId>1</OrderId><OrderStatus>APPROVED</OrderStatus></Order>",
    );
    sendMessage({ queue, message });
    expect(queue.delivered).toEqual([message]);
  });
});

describe("automatic approval", () => {
  // case: SWHR8-C-0100@v1
  it("[SWHR8-C-0100] the order message carries the total and the locale", async () => {
    const { createOrderMessage } = await svc();
    const msg = createOrderMessage({ orderId: "50", total: 123.45, locale: "ja_JP" });
    expect(msg).toMatchObject({ total: 123.45, locale: "ja_JP" });
  });

  // case: SWHR8-C-0101@v1
  it("[SWHR8-C-0101] a US order with total exactly 500 is held pending", async () => {
    const { evaluateOrder } = await svc();
    expect(evaluateOrder({ total: 500, locale: "en_US" })).toBe("PENDING");
  });

  // case: SWHR8-C-0102@v1
  it("[SWHR8-C-0102] an over-limit US order stays PENDING until an administrator decides", async () => {
    const { receiveOrder, getStatus, handleDecision } = await svc();
    const store = statusStore();
    const send = vi.fn();
    receiveOrder({ store, order: { orderId: "60", total: 900, locale: "en_US" } });
    expect(getStatus({ store, orderId: "60" })).toBe("PENDING");
    handleDecision({ store, orderId: "60", decision: "APPROVED", send });
    expect(getStatus({ store, orderId: "60" })).toBe("APPROVED");
  });

  // case: SWHR8-C-0103@v1
  it("[SWHR8-C-0103] a US order with total 499.99 is APPROVED", async () => {
    const { evaluateOrder } = await svc();
    expect(evaluateOrder({ total: 499.99, locale: "en_US" })).toBe("APPROVED");
  });

  // case: SWHR8-C-0104@v1
  it("[SWHR8-C-0104] a US order of 500 and a Japan order of 50000 both remain PENDING", async () => {
    const { evaluateOrder } = await svc();
    expect(evaluateOrder({ total: 500, locale: "en_US" })).toBe("PENDING");
    expect(evaluateOrder({ total: 50000, locale: "ja_JP" })).toBe("PENDING");
  });

  // case: SWHR8-C-0105@v1
  it("[SWHR8-C-0105] a zh_CN order with a small total remains PENDING", async () => {
    const { evaluateOrder } = await svc();
    expect(evaluateOrder({ total: 1, locale: "zh_CN" })).toBe("PENDING");
  });

  // case: SWHR8-C-0106@v1
  it("[SWHR8-C-0106] a ja_JP order with total 49999 is approved automatically", async () => {
    const { evaluateOrder } = await svc();
    expect(evaluateOrder({ total: 49999, locale: "ja_JP" })).toBe("APPROVED");
  });

  // case: SWHR8-C-0107@v1
  it("[SWHR8-C-0107] an en_US order with total 800 stays pending for an administrator", async () => {
    const { evaluateOrder } = await svc();
    expect(evaluateOrder({ total: 800, locale: "en_US" })).toBe("PENDING");
  });
});
