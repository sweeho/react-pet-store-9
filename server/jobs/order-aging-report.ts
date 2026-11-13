// The stuck-order aging report (design B7): PENDING/APPROVED orders older than the threshold,
// then MISMATCH lines, then a count per status. Code 4 plus a mail to ops when anything is listed.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  EXIT_ERROR,
  EXIT_FOUND,
  EXIT_OK,
  safeNotify,
  yyyymmdd,
  type BatchOrder,
  type Notify,
} from "./batch-types";

const STUCK_STATUSES = ["PENDING", "APPROVED"];

export async function runAgingReport(input: {
  orders: BatchOrder[];
  supplierOrders: { orderId: string; status: string }[];
  outDir: string;
  now: Date;
  notify: Notify;
  stuckHours?: number;
  mailOps?: string;
}): Promise<{ file: string; exitCode: number }> {
  const file = path.join(input.outDir, `order_aging_${yyyymmdd(input.now)}.txt`);
  const limit = (input.stuckHours ?? 24) * 3_600_000;
  const stuck = input.orders
    .filter(
      (o) =>
        STUCK_STATUSES.includes(o.status) && input.now.getTime() - o.orderTime.getTime() > limit,
    )
    .sort((a, b) => a.orderTime.getTime() - b.orderTime.getTime());
  const completedSupplier = new Set(
    input.supplierOrders.filter((s) => s.status === "COMPLETED").map((s) => s.orderId),
  );
  const mismatches = input.orders.filter(
    (o) => o.status !== "COMPLETED" && completedSupplier.has(o.orderId),
  );

  const lines = stuck.map((o) =>
    [o.orderId, o.userName, o.locale, String(o.value), o.status].join(" "),
  );
  for (const o of mismatches) {
    lines.push(`MISMATCH ${o.orderId} supplier order COMPLETED, order ${o.status}`);
  }
  for (const status of STUCK_STATUSES) {
    const n = stuck.filter((o) => o.status === status).length;
    if (n > 0) lines.push(`COUNT ${status} ${n}`);
  }

  try {
    await mkdir(input.outDir, { recursive: true });
    await writeFile(file, lines.map((l) => `${l}\n`).join(""), "utf8");
  } catch {
    return { file, exitCode: EXIT_ERROR };
  }
  const exitCode = stuck.length + mismatches.length > 0 ? EXIT_FOUND : EXIT_OK;
  if (exitCode === EXIT_FOUND) {
    await safeNotify(input.notify, {
      to: input.mailOps ?? "ps-ops",
      subject: `Order aging report ${yyyymmdd(input.now)}: ${stuck.length} stuck, ${mismatches.length} mismatch`,
      body: lines.join("\n"),
    });
  }
  return { file, exitCode };
}
