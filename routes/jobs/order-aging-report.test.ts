// @vitest-environment node
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runAgingReport } from "../../server/jobs/order-aging-report";
import type { BatchOrder } from "../../server/jobs/order-extract";

type Mail = { to: string; subject?: string; body?: string };

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
const hoursBefore = (now: Date, h: number): Date => new Date(now.getTime() - h * 3_600_000);

const now = new Date(2026, 2, 20, 1, 45);

async function run(
  orders: ReturnType<typeof order>[],
  supplierOrders: { orderId: string; status: string }[] = [],
) {
  const outDir = await mkdtemp(path.join(tmpdir(), "ag-"));
  const mails: Mail[] = [];
  const result = await runAgingReport({
    orders,
    supplierOrders,
    outDir,
    now,
    notify: async (m) => void mails.push(m),
  });
  const lines = (await readFile(result.file, "utf8")).split("\n").filter((l) => l !== "");
  return { result, lines, mails };
}

describe("runAgingReport", () => {
  it("[SWHR8-C-0120] does not list a PENDING order 23 hours old, nor one exactly 24 hours old", async () => {
    const { lines, result } = await run([
      order("A23", hoursBefore(now, 23), { status: "PENDING" }),
      order("A24", hoursBefore(now, 24), { status: "PENDING" }),
    ]);
    expect(lines.join("\n")).not.toMatch(/A2[34]/);
    expect(result.exitCode).toBe(0);
  });

  it("[SWHR8-C-0121] lists a 30h APPROVED order with its details, oldest first, exit 4", async () => {
    const { lines, result } = await run([
      order("NEWER", hoursBefore(now, 30), {
        status: "APPROVED",
        userName: "dave",
        locale: "de_DE",
        value: 77.25,
      }),
      order("OLDER", hoursBefore(now, 50), { status: "PENDING" }),
    ]);
    expect(result.exitCode).toBe(4);
    expect(lines[0]).toContain("OLDER");
    expect(lines[1]).toMatch(/NEWER.*dave.*de_DE.*77\.25.*APPROVED/);
  });

  it("[SWHR8-C-0122] lists nothing and exits 0 when nothing is stuck", async () => {
    const { lines, result, mails } = await run([
      order("NEW", hoursBefore(now, 2), { status: "PENDING" }),
      order("DONE", hoursBefore(now, 100), { status: "COMPLETED" }),
    ]);
    expect(lines.join("\n")).not.toMatch(/NEW|DONE|MISMATCH/);
    expect(result.exitCode).toBe(0);
    expect(mails).toEqual([]);
  });

  it("[SWHR8-C-0123] lists MISMATCH when the supplier order is COMPLETED and the order is not", async () => {
    const { lines, result } = await run(
      [order("MIS", hoursBefore(now, 1), { status: "APPROVED" })],
      [{ orderId: "MIS", status: "COMPLETED" }],
    );
    expect(lines.some((l) => l.startsWith("MISMATCH") && l.includes("MIS"))).toBe(true);
    expect(result.exitCode).toBe(4);
  });

  it("[SWHR8-C-0127] mails ps-ops when the exit code is 4", async () => {
    const { result, mails } = await run([
      order("OLD", hoursBefore(now, 48), { status: "PENDING" }),
    ]);
    expect(result.exitCode).toBe(4);
    expect(mails.map((m) => m.to)).toEqual(["ps-ops"]);
  });
});
