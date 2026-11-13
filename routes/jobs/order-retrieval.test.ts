// @vitest-environment node
import { describe, expect, it } from "vitest";

import { findOrdersBetween } from "../../server/lib/orders";
import type { BatchOrder } from "../../server/jobs/order-extract";

const order = (orderId: string, orderTime: Date, over: Partial<BatchOrder> = {}): BatchOrder => ({
  orderId,
  userName: "alice",
  orderTime,
  locale: "en_US",
  value: 123.45,
  lineCount: 2,
  status: "COMPLETED",
  ...over,
});

describe("findOrdersBetween", () => {
  it("[SWHR8-C-0118] includes orders on begin and on end, excludes those outside", () => {
    const begin = new Date("2026-03-10T08:00:00Z");
    const end = new Date("2026-03-12T08:00:00Z");
    const orders = [
      order("BEFORE", new Date(begin.getTime() - 1)),
      order("ON-BEGIN", begin),
      order("MID", new Date("2026-03-11T00:00:00Z")),
      order("ON-END", end),
      order("AFTER", new Date(end.getTime() + 1)),
    ];
    expect(findOrdersBetween({ orders, begin, end }).map((o) => o.orderId)).toEqual([
      "ON-BEGIN",
      "MID",
      "ON-END",
    ]);
  });
});
