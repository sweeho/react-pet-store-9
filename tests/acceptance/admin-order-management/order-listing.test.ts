// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/lib/admin-orders.ts exports
//   findOrdersByStatus({ orders, status }): Order[]            exact, case-sensitive status match
//   listOrdersByStatus({ purchaseOrders, statusRecords, status }):
//     { orders: { orderId, userId, date (M/D/YYYY), value, status }[]; count: number }
//     throws an error named "AdminFacadeError" when a status record has no purchase order
//   orderStatusView({ purchaseOrders, statusRecords }): { orderId, userId, date, value, status }[]
// purchaseOrders: { orderId, userId, orderDate (Date), value }[]; statusRecords: { orderId, status }[]
const load = () => import("../../../server/lib/admin-orders");

const po = (orderId: string, orderDate = new Date(2026, 2, 10), value = 50) => ({
  orderId,
  userId: "alice",
  orderDate,
  value,
});

describe("admin order listing", () => {
  // case: SWHR8-C-0248@v1
  it("[SWHR8-C-0248] returns an approved order with id, user id, date 1/3/2005, value and status", async () => {
    const { listOrdersByStatus } = await load();

    const result = listOrdersByStatus({
      purchaseOrders: [po("1001", new Date(2005, 0, 3), 99.5)],
      statusRecords: [{ orderId: "1001", status: "APPROVED" }],
      status: "APPROVED",
    });

    expect(result.orders).toEqual([
      { orderId: "1001", userId: "alice", date: "1/3/2005", value: 99.5, status: "APPROVED" },
    ]);
  });

  // case: SWHR8-C-0249@v1
  it("[SWHR8-C-0249] raises an admin facade error when the status record's purchase order is missing", async () => {
    const { listOrdersByStatus } = await load();

    expect(() =>
      listOrdersByStatus({
        purchaseOrders: [],
        statusRecords: [{ orderId: "404", status: "PENDING" }],
        status: "PENDING",
      }),
    ).toThrowError(expect.objectContaining({ name: "AdminFacadeError" }));
  });

  // case: SWHR8-C-0250@v1
  it("[SWHR8-C-0250] PENDING query returns only the pending orders", async () => {
    const { findOrdersByStatus } = await load();
    const orders = [
      { orderId: "1", status: "PENDING" },
      { orderId: "2", status: "APPROVED" },
      { orderId: "3", status: "PENDING" },
    ];

    const found = findOrdersByStatus({ orders, status: "PENDING" });

    expect(found.map((o: { orderId: string }) => o.orderId).sort()).toEqual(["1", "3"]);
  });

  // case: SWHR8-C-0251@v1
  it("[SWHR8-C-0251] lower-case 'pending' does not match a PENDING order", async () => {
    const { findOrdersByStatus } = await load();

    const found = findOrdersByStatus({
      orders: [{ orderId: "1", status: "PENDING" }],
      status: "pending",
    });

    expect(found).toEqual([]);
  });

  // case: SWHR8-C-0261@v1
  it("[SWHR8-C-0261] three DENIED orders give three results and a total count of 3", async () => {
    const { listOrdersByStatus } = await load();

    const result = listOrdersByStatus({
      purchaseOrders: [po("1"), po("2"), po("3"), po("4")],
      statusRecords: [
        { orderId: "1", status: "DENIED" },
        { orderId: "2", status: "DENIED" },
        { orderId: "3", status: "DENIED" },
        { orderId: "4", status: "APPROVED" },
      ],
      status: "DENIED",
    });

    expect(result.orders).toHaveLength(3);
    expect(result.count).toBe(3);
  });

  // case: SWHR8-C-0258@v1
  it("[SWHR8-C-0258] status view row shows order id, user, date, value and status", async () => {
    const { orderStatusView } = await load();

    const rows = orderStatusView({
      purchaseOrders: [po("7", new Date(2026, 2, 10), 12.5)],
      statusRecords: [{ orderId: "7", status: "PENDING" }],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      orderId: "7",
      userId: "alice",
      value: 12.5,
      status: "PENDING",
    });
    expect(rows[0].date).toBeTruthy();
  });
});
