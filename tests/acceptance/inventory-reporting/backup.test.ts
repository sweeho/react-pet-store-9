// @vitest-environment node
import { mkdir, mkdtemp, readdir, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/jobs/backup.ts exports
//   runBackup({ backupRoot, now, retentionDays? }): Promise<{ exitCode: number }>
// It writes a folder PetStoreDB_YYYYMMDD under backupRoot and deletes backup folders older than the retention (default 7 days).
const loadBackup = () => import("../../../server/jobs/backup");

const stamp = (d: Date) => d.toISOString().slice(0, 10).replaceAll("-", "");
const DAY = 86_400_000;

async function oldBackupFolder(root: string, now: Date, daysOld: number): Promise<string> {
  const when = new Date(now.getTime() - daysOld * DAY);
  const name = `PetStoreDB_${stamp(when)}`;
  const dir = path.join(root, name);
  await mkdir(dir, { recursive: true });
  await utimes(dir, when, when);
  return name;
}

describe("backup job", () => {
  // case: SWHR8-C-0141@v1
  it("[SWHR8-C-0141] deletes a backup folder older than 7 days", async () => {
    const { runBackup } = await loadBackup();
    const root = await mkdtemp(path.join(tmpdir(), "backup-"));
    const now = new Date("2026-03-20T01:00:00Z");
    const old = await oldBackupFolder(root, now, 10);

    await runBackup({ backupRoot: root, now });

    expect(await readdir(root)).not.toContain(old);
  });

  // case: SWHR8-C-0145@v1
  it("[SWHR8-C-0145] creates the dated PetStoreDB_ folder and removes folders older than 7 days", async () => {
    const { runBackup } = await loadBackup();
    const root = await mkdtemp(path.join(tmpdir(), "backup-"));
    const now = new Date("2026-03-20T01:00:00Z");
    const old = await oldBackupFolder(root, now, 9);
    const recent = await oldBackupFolder(root, now, 2);

    const result = await runBackup({ backupRoot: root, now });
    const folders = await readdir(root);

    expect(result.exitCode).toBe(0);
    expect(folders).toContain(`PetStoreDB_${stamp(now)}`);
    expect(folders).not.toContain(old);
    expect(folders).toContain(recent);
  });
});
