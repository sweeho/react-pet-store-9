// @vitest-environment node
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { type Mail, hoursBefore, order, recipients } from "./helpers";

// Assumed module boundary: server/jobs/order-aging-report.ts exports
//   runAgingReport({ orders, supplierOrders, outDir, now, notify }): Promise<{ file: string; exitCode: number }>
// orders: { orderId, userName, orderTime (Date), locale, value, status }[]
// supplierOrders: { orderId, status }[] (the supplier order of an order, by order id)
// Writes order_aging_YYYYMMDD.txt into outDir. PENDING/APPROVED orders older than 24 hours are listed
// with number, user, locale, value and status; an order whose supplier order is COMPLETED while the
// order is not COMPLETED gets a line starting with MISMATCH. exitCode is 4 when anything is listed,
// else 0. When the exit code is 4, notify({ to: "ps-ops", subject, body }) is called.
const loadAging = () => import("../../../server/jobs/order-aging-report");

const now = new Date(2026, 2, 20, 1, 45);

async function runReport(
  orders: ReturnType<typeof order>[],
  supplierOrders: { orderId: string; status: string }[] = [],
) {
  const { runAgingReport } = await loadAging();
  const outDir = await mkdtemp(path.join(tmpdir(), "aging-"));
  const mails: Mail[] = [];
  const result = await runAgingReport({
    orders,
    supplierOrders,
    outDir,
    now,
    notify: async (m: Mail) => void mails.push(m),
  });
  const text = await readFile(result.file, "utf8");
  return { result, text, mails };
}

describe("order aging report", () => {
  // case: SWHR8-C-0120@v1
  it("[SWHR8-C-0120] does not report a PENDING order placed 23 hours ago as stuck", async () => {
    const { text } = await runReport([
      order("ORD-23H", hoursBefore(now, 23), { status: "PENDING" }),
    ]);

    expect(text).not.toContain("ORD-23H");
  });

  // case: SWHR8-C-0121@v1
  it("[SWHR8-C-0121] lists a 30-hour-old APPROVED order with its details and ends with code 4", async () => {
    const { result, text } = await runReport([
      order("ORD-30H", hoursBefore(now, 30), {
        status: "APPROVED",
        userName: "dave",
        locale: "de_DE",
        value: 77.25,
      }),
    ]);

    const line = text.split("\n").find((l) => l.includes("ORD-30H")) ?? "";
    expect(line).toContain("dave");
    expect(line).toContain("de_DE");
    expect(line).toContain("77.25");
    expect(line).toContain("APPROVED");
    expect(result.exitCode).toBe(4);
  });

  // case: SWHR8-C-0122@v1
  it("[SWHR8-C-0122] lists nothing and does not end with code 4 when nothing is stuck", async () => {
    const { result, text } = await runReport([
      order("ORD-NEW", hoursBefore(now, 2), { status: "PENDING" }),
      order("ORD-DONE", hoursBefore(now, 100), { status: "COMPLETED" }),
    ]);

    expect(text).not.toContain("ORD-NEW");
    expect(text).not.toContain("ORD-DONE");
    expect(text).not.toContain("MISMATCH");
    expect(result.exitCode).not.toBe(4);
  });

  // case: SWHR8-C-0123@v1
  it("[SWHR8-C-0123] lists a MISMATCH line when the supplier order is COMPLETED but the order is APPROVED", async () => {
    const { result, text } = await runReport(
      [order("ORD-MIS", hoursBefore(now, 1), { status: "APPROVED" })],
      [{ orderId: "ORD-MIS", status: "COMPLETED" }],
    );

    expect(text.split("\n").some((l) => l.includes("MISMATCH") && l.includes("ORD-MIS"))).toBe(
      true,
    );
    expect(result.exitCode).toBe(4);
  });

  // case: SWHR8-C-0127@v1
  it("[SWHR8-C-0127] mails ps-ops when the aging report ends with code 4", async () => {
    const { result, mails } = await runReport([
      order("ORD-OLD", hoursBefore(now, 48), { status: "PENDING" }),
    ]);

    expect(result.exitCode).toBe(4);
    expect(recipients(mails)).toContain("ps-ops");
  });
});
