// @vitest-environment node
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runOrderExtract } from "../../server/jobs/order-extract";
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
const localMidnight = (now: Date, days = 0): Date =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);

const now = new Date(2026, 0, 2, 1, 30);
const yesterday = localMidnight(now, 1);
const today = localMidnight(now, 0);

async function run(orders: ReturnType<typeof order>[], outDir?: string) {
  const dir = outDir ?? (await mkdtemp(path.join(tmpdir(), "ex-")));
  const mails: Mail[] = [];
  const result = await runOrderExtract({
    orders,
    outDir: dir,
    now,
    notify: async (m) => void mails.push(m),
  });
  return { result, mails };
}
const lines = async (file: string) =>
  (await readFile(file, "utf8")).split("\n").filter((l) => l !== "");

describe("runOrderExtract", () => {
  it("[SWHR8-C-0131] writes yesterday's orders sorted numerically, quoted text, no header", async () => {
    const at = (h: number) => new Date(yesterday.getTime() + h * 3_600_000);
    const { result } = await run([
      order("10", at(3), { userName: "bob", value: 9.5, lineCount: 1, status: "APPROVED" }),
      order("9", at(2)),
      order("11", today),
      order("8", new Date(yesterday.getTime() - 1)),
    ]);
    expect(path.basename(result.file)).toBe("orders_20260101.csv");
    expect(await lines(result.file)).toEqual([
      `"9","alice",${at(2).getTime()},"en_US",123.45,2,"COMPLETED"`,
      `"10","bob",${at(3).getTime()},"en_US",9.5,1,"APPROVED"`,
      "TRAILER,20260101,2",
    ]);
    expect(result.exitCode).toBe(0);
  });

  it("[SWHR8-C-0132] ends with TRAILER,YYYYMMDD,count", async () => {
    const orders = Array.from({ length: 120 }, (_, i) =>
      order(String(1000 + i), new Date(yesterday.getTime() + (i + 1) * 60_000)),
    );
    const { result } = await run(orders);
    const l = await lines(result.file);
    expect(l.at(-1)).toBe("TRAILER,20260101,120");
    expect(l).toHaveLength(121);
  });

  it("[SWHR8-C-0135] includes yesterday 00:00 and excludes today 00:00", async () => {
    const { result } = await run([order("FIRST", yesterday), order("SECOND", today)]);
    const l = await lines(result.file);
    expect(l).toHaveLength(2);
    expect(l[0]).toContain('"FIRST"');
  });

  it("[SWHR8-C-0126] resolves with code 8 and mails ps-finance when the file cannot be written", async () => {
    const blocker = path.join(await mkdtemp(path.join(tmpdir(), "ex-")), "file");
    await writeFile(blocker, "x");
    const { result, mails } = await run([order("1", yesterday)], path.join(blocker, "sub"));
    expect(result.exitCode).toBe(8);
    expect(mails.map((m) => m.to)).toEqual(["ps-finance"]);
  });
});
