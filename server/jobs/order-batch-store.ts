// Database side of the order batch jobs (design B1, B6): loads plain data through the repositories
// and runs each job. The pure modules never touch the database.
import { db } from "../../db/client";
import { deleteOrderRows, listBatchOrders } from "../checkout/repository";
import { deleteSupplierOrderRows, listSupplierOrderStatuses } from "../fulfillment/repository";
import { mailSender, smtpTransport } from "../notifications/transport";
import { batchSettings } from "./batch-settings";
import type { BatchMail, Notify } from "./batch-types";
import { runAgingReport } from "./order-aging-report";
import { runOrderExtract } from "./order-extract";
import { selectPurgeable } from "./order-purge";

/** Mail through the SMTP transport; a send without a server rejects and the job logs it. */
export const smtpNotify: Notify = async (mail: BatchMail) => {
  await smtpTransport().send({
    to: [mail.to],
    from: mailSender(),
    subject: mail.subject,
    contentType: "text/plain",
    body: mail.body,
  });
};

export async function runExtractJob(now = new Date()): Promise<number> {
  const s = batchSettings();
  const { file, exitCode } = await runOrderExtract({
    orders: listBatchOrders(db),
    outDir: s.outDir,
    now,
    notify: smtpNotify,
    mailFinance: s.mailFinance,
  });
  console.log(
    `Order extract ${exitCode === 0 ? "wrote" : "failed for"} ${file} (exit ${exitCode})`,
  );
  return exitCode;
}

export async function runAgingJob(now = new Date()): Promise<number> {
  const s = batchSettings();
  const { file, exitCode } = await runAgingReport({
    orders: listBatchOrders(db),
    supplierOrders: listSupplierOrderStatuses(db),
    outDir: s.outDir,
    now,
    notify: smtpNotify,
    stuckHours: s.stuckHours,
    mailOps: s.mailOps,
  });
  console.log(`Order aging report ${file} (exit ${exitCode})`);
  return exitCode;
}

/** Deletes every purgeable order and its dependents in ONE transaction, children first (design B6). */
export function purgeOrdersInDb(
  now: Date,
  retentionDays: number,
): { exitCode: number; purgedOrderIds: string[]; transactions: number } {
  const ids = selectPurgeable({ orders: listBatchOrders(db), now, retentionDays }).map(
    (o) => o.orderId,
  );
  if (ids.length === 0) return { exitCode: 0, purgedOrderIds: [], transactions: 0 };
  db.transaction((tx) => {
    for (const id of ids) {
      if (/^\d+$/.test(id)) deleteSupplierOrderRows(tx, Number(id));
      deleteOrderRows(tx, id);
    }
  });
  return { exitCode: 0, purgedOrderIds: ids, transactions: 1 };
}

export async function runPurgeJob(now = new Date()): Promise<number> {
  try {
    const { purgedOrderIds, exitCode } = purgeOrdersInDb(now, batchSettings().retentionDays);
    console.log(`Order purge removed ${purgedOrderIds.length} orders`);
    return exitCode;
  } catch (error) {
    console.error("Order purge failed:", error);
    return 8;
  }
}
