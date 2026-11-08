// @vitest-environment node
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { type Mail, localMidnight, order, recipients } from "./helpers";

// Assumed module boundary: server/jobs/order-extract.ts exports
//   runOrderExtract({ orders, outDir, now, notify }): Promise<{ file: string; exitCode: number }>
// orders: { orderId, userName, orderTime (Date), locale, value, lineCount, status }[]; now is local time.
// Writes orders_YYYYMMDD.csv (yesterday's date) into outDir: orders dated yesterday 00:00 up to but
// excluding today 00:00, ordered by order id, no header row, columns order id, user, order time
// (epoch ms), locale, value, line count, status, then a final TRAILER,YYYYMMDD,<rows> line.
// On failure it does not throw: it resolves with a non-zero exitCode and calls
// notify({ to: "ps-finance", subject, body }).
const loadExtract = () => import("../../../server/jobs/order-extract");

const now = new Date(2026, 0, 2, 1, 30); // 2026-01-02 01:30 local, so yesterday is 20260101
const yesterday = localMidnight(now, 1);
const today = localMidnight(now, 0);
const unquote = (s: string) => s.replace(/^"|"$/g, "");

async function extract(orders: ReturnType<typeof order>[]) {
  const { runOrderExtract } = await loadExtract();
  const outDir = await mkdtemp(path.join(tmpdir(), "extract-"));
  const mails: Mail[] = [];
  const result = await runOrderExtract({
    orders,
    outDir,
    now,
    notify: async (m: Mail) => void mails.push(m),
  });
  const text = await readFile(result.file, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l !== "");
  return { result, lines, mails };
}

describe("order extract", () => {
  // case: SWHR8-C-0131@v1
  it("[SWHR8-C-0131] contains only yesterday's orders, by order number, seven columns, no header", async () => {
    const at = (h: number) => new Date(yesterday.getTime() + h * 3_600_000);
    const orders = [
      order("1003", at(20), {
        userName: "carol",
        locale: "fr_FR",
        value: 9.5,
        lineCount: 1,
        status: "APPROVED",
      }),
      order("1001", at(2), { userName: "alice" }),
      order("1002", at(10), { userName: "bob" }),
      order("2000", new Date(today.getTime() + 3_600_000)),
      order("0900", new Date(yesterday.getTime() - 3_600_000)),
    ];

    const { result, lines } = await extract(orders);

    expect(path.basename(result.file)).toBe("orders_20260101.csv");
    const rows = lines
      .filter((l) => !l.startsWith("TRAILER"))
      .map((l) => l.split(",").map(unquote));
    expect(rows.map((r) => r[0])).toEqual(["1001", "1002", "1003"]);
    expect(rows.every((r) => r.length === 7)).toBe(true);
    expect(rows[0][0]).not.toMatch(/order/i); // no header row
    expect(rows[2]).toEqual([
      "1003",
      "carol",
      String(at(20).getTime()),
      "fr_FR",
      "9.5",
      "1",
      "APPROVED",
    ]);
  });

  // case: SWHR8-C-0132@v1
  it("[SWHR8-C-0132] ends with the trailer line TRAILER,20260101,120", async () => {
    const orders = Array.from({ length: 120 }, (_, i) =>
      order(String(1000 + i), new Date(yesterday.getTime() + (i + 1) * 60_000)),
    );

    const { lines } = await extract(orders);

    expect(lines.at(-1)).toBe("TRAILER,20260101,120");
    expect(lines).toHaveLength(121);
  });

  // case: SWHR8-C-0135@v1
  it("[SWHR8-C-0135] includes an order at yesterday 00:00 and excludes one at today 00:00", async () => {
    const orders = [order("FIRST", yesterday), order("SECOND", today)];

    const { lines } = await extract(orders);
    const ids = lines.filter((l) => !l.startsWith("TRAILER")).map((l) => unquote(l.split(",")[0]));

    expect(ids).toEqual(["FIRST"]);
  });

  // case: SWHR8-C-0126@v1
  it("[SWHR8-C-0126] mails ps-finance when the extract fails", async () => {
    const { runOrderExtract } = await loadExtract();
    const blocker = path.join(await mkdtemp(path.join(tmpdir(), "extract-")), "not-a-dir");
    await writeFile(blocker, "x");
    const mails: Mail[] = [];

    const result = await runOrderExtract({
      orders: [order("1", yesterday)],
      outDir: path.join(blocker, "sub"), // cannot be created: its parent is a file
      now,
      notify: async (m: Mail) => void mails.push(m),
    });

    expect(result.exitCode).not.toBe(0);
    expect(recipients(mails)).toContain("ps-finance");
  });
});
