// The daily Finance extract (design B7, B3): yesterday's orders, local time, as orders_YYYYMMDD.csv.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  EXIT_ERROR,
  EXIT_OK,
  safeNotify,
  yyyymmdd,
  type BatchOrder,
  type Notify,
} from "./batch-types";

export type { BatchOrder } from "./batch-types";

const quote = (s: string): string => `"${s.replaceAll('"', '""')}"`;
const numeric = /^\d+$/;

/** By order number, numerically when both ids are numeric. */
const byOrderNumber = (a: BatchOrder, b: BatchOrder): number =>
  numeric.test(a.orderId) && numeric.test(b.orderId)
    ? Number(a.orderId) - Number(b.orderId)
    : a.orderId < b.orderId
      ? -1
      : a.orderId > b.orderId
        ? 1
        : 0;

export async function runOrderExtract(input: {
  orders: BatchOrder[];
  outDir: string;
  now: Date;
  notify: Notify;
  mailFinance?: string;
}): Promise<{ file: string; exitCode: number }> {
  const { now } = input;
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const file = path.join(input.outDir, `orders_${yyyymmdd(from)}.csv`);
  try {
    const rows = input.orders
      .filter((o) => o.orderTime >= from && o.orderTime < to)
      .sort(byOrderNumber);
    const lines = rows.map((o) =>
      [
        quote(o.orderId),
        quote(o.userName),
        o.orderTime.getTime(),
        quote(o.locale),
        String(o.value),
        o.lineCount,
        quote(o.status),
      ].join(","),
    );
    lines.push(`TRAILER,${yyyymmdd(from)},${rows.length}`);
    await mkdir(input.outDir, { recursive: true });
    await writeFile(file, `${lines.join("\n")}\n`, "utf8");
    return { file, exitCode: EXIT_OK };
  } catch (error) {
    await safeNotify(input.notify, {
      to: input.mailFinance ?? "ps-finance",
      subject: `Order extract failed for ${yyyymmdd(from)}`,
      body: `The daily order extract failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return { file, exitCode: EXIT_ERROR };
  }
}
