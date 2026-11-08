// @vitest-environment node
import { describe, expect, it } from "vitest";
import { order } from "./helpers";

// Assumed module boundary: server/lib/orders.ts exports
//   findOrdersBetween({ orders, begin, end }): Order[]
// orders: { orderId, orderTime (Date), ... }[]; returns orders with begin <= orderTime <= end.
const loadOrders = () => import("../../../server/lib/orders");

describe("order retrieval by date range", () => {
  // case: SWHR8-C-0118@v1
  it("[SWHR8-C-0118] returns orders from begin to end inclusive and none before or after", async () => {
    const { findOrdersBetween } = await loadOrders();
    const begin = new Date("2026-03-10T08:00:00Z");
    const end = new Date("2026-03-12T08:00:00Z");
    const orders = [
      order("BEFORE", new Date(begin.getTime() - 1)),
      order("ON-BEGIN", begin),
      order("WITHIN", new Date("2026-03-11T08:00:00Z")),
      order("ON-END", end),
      order("AFTER", new Date(end.getTime() + 1)),
    ];

    const found = findOrdersBetween({ orders, begin, end });

    expect(found.map((o) => o.orderId).sort()).toEqual(["ON-BEGIN", "ON-END", "WITHIN"]);
  });
});
