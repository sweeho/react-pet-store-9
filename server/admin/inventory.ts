// Inventory update (change swhr8-i-0010, design F8): sets stock and re-attempts waiting supplier
// orders in one transaction, queueing each invoice in that same transaction.
import { sendMessage } from "../approval/service";
import { databaseQueue } from "../approval/queue";
import { INVOICE_QUEUE, scheduleFulfillmentDrain } from "../fulfillment/queue";
import { publishInvoices, toQuantity, updateInventory } from "../fulfillment/service";
import { withDatabaseStore } from "../fulfillment/store";

/** Saves the valid entries (blank, negative and non-numeric ones are ignored); returns how many were saved. */
export function saveInventory(quantities: Record<string, unknown>): {
  saved: number;
  ignored: number;
} {
  const valid = Object.fromEntries(
    Object.entries(quantities).filter(([, v]) => toQuantity(v) !== undefined),
  );
  withDatabaseStore((store, tx) =>
    updateInventory({
      store,
      quantities: valid,
      now: new Date(),
      publish: (invoice) =>
        publishInvoices({
          invoices: [invoice],
          connectionFactory: () => ({
            send: (text) => sendMessage({ queue: databaseQueue(INVOICE_QUEUE, tx), message: text }),
            close() {},
          }),
        }),
    }),
  );
  scheduleFulfillmentDrain();
  const saved = Object.keys(valid).length;
  return { saved, ignored: Object.keys(quantities).length - saved };
}
