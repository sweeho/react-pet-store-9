// Shared fixtures for the order-fulfillment acceptance tests.
export type Line = {
  category: string;
  product: string;
  item: string;
  lineNumber: number;
  quantity: number;
  unitPrice: number;
  shipped: number;
};
export type SupplierOrder = {
  id: number;
  userId: string;
  orderDate: Date;
  status: "PENDING" | "COMPLETED";
  contact?: { firstName: string; lastName: string; email: string };
  lines: Line[];
};
export type Store = {
  inventory: Record<string, number>;
  supplierOrders: SupplierOrder[];
  transactions: number;
  transaction: <T>(fn: () => T) => T;
};

export const line = (item: string, quantity: number, over: Partial<Line> = {}): Line => ({
  category: "FISH",
  product: `P-${item}`,
  item,
  lineNumber: 1,
  quantity,
  unitPrice: 10,
  shipped: 0,
  ...over,
});

export const supplierOrder = (
  id: number,
  lines: Line[],
  over: Partial<SupplierOrder> = {},
): SupplierOrder => ({
  id,
  userId: "alice",
  orderDate: new Date(2026, 2, 10),
  status: "PENDING",
  contact: { firstName: "Al", lastName: "Ice", email: "al@example.com" },
  lines,
  ...over,
});

// In-memory store with a transaction counter.
export function memoryStore(
  inventory: Record<string, number>,
  orders: SupplierOrder[] = [],
): Store {
  const store: Store = {
    inventory: { ...inventory },
    supplierOrders: [...orders],
    transactions: 0,
    transaction(fn) {
      store.transactions += 1;
      return fn();
    },
  };
  return store;
}

export const incomingOrder = (orderId: number, lines: Partial<Line>[] = [{}]) => ({
  orderId,
  userId: "alice",
  orderDate: "2026-03-10",
  shippingAddress: {
    firstName: "Al",
    lastName: "Ice",
    street: "1 Main",
    city: "Town",
    state: "CA",
    country: "US",
    zipCode: "90000",
    email: "al@example.com",
    phone: "555-0100",
  },
  lines: lines.map((l, i) => ({
    category: "FISH",
    product: "P1",
    item: "EST-1",
    lineNumber: i + 1,
    quantity: 1,
    unitPrice: 10,
    ...l,
  })),
});

import { describe, expect, it } from "vitest";

describe("fulfilment fixtures", () => {
  it("builds a line with shipped 0", () => {
    expect(line("A", 2).shipped).toBe(0);
  });
});
