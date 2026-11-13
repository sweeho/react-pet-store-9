// @vitest-environment node
import { mkdir, mkdtemp, readdir, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { yyyymmdd } from "../../../server/jobs/batch-types";
import { runBackup } from "../../../server/jobs/backup";

const DAY = 86_400_000;
const now = new Date(2026, 2, 20, 1, 0);

async function folder(root: string, daysOld: number): Promise<string> {
  const when = new Date(now.getTime() - daysOld * DAY);
  const name = `PetStoreDB_${yyyymmdd(when)}`;
  const dir = path.join(root, name);
  await mkdir(dir, { recursive: true });
  await utimes(dir, when, when);
  return name;
}

describe("backup job", () => {
  it("[SWHR8-C-0141] deletes a backup folder older than 7 days", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backup-"));
    const old = await folder(root, 10);
    await runBackup({ backupRoot: root, now, snapshot: () => undefined });
    expect(await readdir(root)).not.toContain(old);
  });

  it("[SWHR8-C-0145] creates the dated folder via the snapshot and prunes old ones", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backup-"));
    const old = await folder(root, 9);
    const recent = await folder(root, 2);
    const snapped: string[] = [];
    const result = await runBackup({
      backupRoot: root,
      now,
      snapshot: (dir) => void snapped.push(dir),
    });
    const names = await readdir(root);
    expect(result.exitCode).toBe(0);
    expect(names).toContain(`PetStoreDB_${yyyymmdd(now)}`);
    expect(snapped).toEqual([path.join(root, `PetStoreDB_${yyyymmdd(now)}`)]);
    expect(names).not.toContain(old);
    expect(names).toContain(recent);
  });

  it("honours a custom retention and exits 8 when the snapshot fails", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backup-"));
    const mid = await folder(root, 3);
    await runBackup({ backupRoot: root, now, retentionDays: 2, snapshot: () => undefined });
    expect(await readdir(root)).not.toContain(mid);
    const failed = await runBackup({
      backupRoot: root,
      now,
      snapshot: () => {
        throw new Error("disk full");
      },
    });
    expect(failed.exitCode).toBe(8);
  });

  it("default snapshot writes a consistent copy of the live db", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "backup-"));
    const result = await runBackup({ backupRoot: root, now });
    expect(result.exitCode).toBe(0);
    expect(await readdir(path.join(root, `PetStoreDB_${yyyymmdd(now)}`))).toContain("sqlite.db");
  });
});
