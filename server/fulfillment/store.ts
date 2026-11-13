// Database Store (change swhr8-i-0010, design F2): load, mutate, save inside one SQLite transaction.
import { db } from "../../db/client";
import type { Tx } from "../checkout/repository";
import {
  insertSupplierOrder,
  loadInventory,
  loadSupplierOrdersByStatus,
  updateSupplierOrder,
  writeInventory,
} from "./repository";
import type { Store } from "./service";

/**
 * Runs `fn` against the stock and the PENDING supplier orders loaded inside one transaction, then
 * writes back changed stock, shipped quantities, statuses and new orders. `fn` may also use `tx`
 * (to queue invoices), so everything commits or rolls back together.
 */
export function withDatabaseStore<T>(fn: (store: Store, tx: Tx) => T): T {
  return db.transaction((tx) => {
    const inventory = loadInventory(tx);
    const before = { ...inventory };
    const supplierOrders = loadSupplierOrdersByStatus(tx, "PENDING");
    const existing = new Set(supplierOrders.map((o) => o.id));
    const store: Store = { inventory, supplierOrders, transaction: (run) => run() };
    const result = fn(store, tx);
    for (const [itemId, quantity] of Object.entries(inventory)) {
      if (before[itemId] !== quantity) writeInventory(tx, itemId, quantity);
    }
    for (const order of supplierOrders) {
      if (existing.has(order.id)) updateSupplierOrder(tx, order);
      else insertSupplierOrder(tx, { ...order, contact: order.contact ?? {} });
    }
    return result;
  });
}
