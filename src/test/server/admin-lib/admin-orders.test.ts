// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  findOrdersByStatus,
  listOrdersByStatus,
  orderStatusView,
} from "../../../../server/lib/admin-orders";

const po = (orderId: string, orderDate = new Date(2026, 2, 10), value = 50) => ({
  orderId,
  userId: "alice",
  orderDate,
  value,
});

describe("admin order listing", () => {
  // case: SWHR8-C-0248@v1
  it("[SWHR8-C-0248] returns an order with id, user, date 1/3/2005, value and status", () => {
    const r = listOrdersByStatus({
      purchaseOrders: [po("1001", new Date(2005, 0, 3), 99.5)],
      statusRecords: [{ orderId: "1001", status: "APPROVED" }],
      status: "APPROVED",
    });
    expect(r.orders).toEqual([
      { orderId: "1001", userId: "alice", date: "1/3/2005", value: 99.5, status: "APPROVED" },
    ]);
  });

  // case: SWHR8-C-0249@v1
  it("[SWHR8-C-0249] a status record without a purchase order raises AdminFacadeError", () => {
    expect(() =>
      listOrdersByStatus({
        purchaseOrders: [],
        statusRecords: [{ orderId: "404", status: "PENDING" }],
        status: "PENDING",
      }),
    ).toThrowError(expect.objectContaining({ name: "AdminFacadeError" }));
  });

  // case: SWHR8-C-0250@v1
  it("[SWHR8-C-0250] PENDING query returns only pending orders", () => {
    const orders = [
      { orderId: "1", status: "PENDING" },
      { orderId: "2", status: "APPROVED" },
      { orderId: "3", status: "PENDING" },
    ];
    expect(findOrdersByStatus({ orders, status: "PENDING" }).map((o) => o.orderId)).toEqual([
      "1",
      "3",
    ]);
  });

  // case: SWHR8-C-0251@v1
  it("[SWHR8-C-0251] lower-case 'pending' does not match", () => {
    expect(
      findOrdersByStatus({ orders: [{ orderId: "1", status: "PENDING" }], status: "pending" }),
    ).toEqual([]);
  });

  // case: SWHR8-C-0261@v1
  it("[SWHR8-C-0261] three DENIED orders give three results and count 3", () => {
    const r = listOrdersByStatus({
      purchaseOrders: [po("1"), po("2"), po("3"), po("4")],
      statusRecords: [
        { orderId: "1", status: "DENIED" },
        { orderId: "2", status: "DENIED" },
        { orderId: "3", status: "DENIED" },
        { orderId: "4", status: "APPROVED" },
      ],
      status: "DENIED",
    });
    expect(r.orders).toHaveLength(3);
    expect(r.count).toBe(3);
  });

  // case: SWHR8-C-0258@v1
  it("[SWHR8-C-0258] a status view row shows id, user, date, value and status", () => {
    const rows = orderStatusView({
      purchaseOrders: [po("7", new Date(2026, 2, 10), 12.5)],
      statusRecords: [{ orderId: "7", status: "PENDING" }],
    });
    expect(rows).toEqual([
      { orderId: "7", userId: "alice", date: "3/10/2026", value: 12.5, status: "PENDING" },
    ]);
  });
});
