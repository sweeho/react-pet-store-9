// The nightly online backup with retention (design I6).
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

import { EXIT_ERROR, EXIT_OK, yyyymmdd } from "./batch-types";

const DAY = 86_400_000;
const PREFIX = "PetStoreDB_";

/** SQLite `VACUUM INTO` on the live connection: an online, consistent copy. */
async function defaultSnapshot(dir: string): Promise<void> {
  const { db } = await import("../../db/client");
  const target = path.join(dir, "sqlite.db").replaceAll("'", "''");
  db.run(`VACUUM INTO '${target}'`);
}

export async function runBackup(input: {
  backupRoot: string;
  now: Date;
  retentionDays?: number;
  snapshot?: (dir: string) => Promise<void> | void;
}): Promise<{ exitCode: number }> {
  const { backupRoot, now, retentionDays = 7, snapshot = defaultSnapshot } = input;
  const today = `${PREFIX}${yyyymmdd(now)}`;
  try {
    const dir = path.join(backupRoot, today);
    await mkdir(dir, { recursive: true });
    await snapshot(dir);
    for (const name of await readdir(backupRoot)) {
      if (!name.startsWith(PREFIX) || name === today) continue;
      const full = path.join(backupRoot, name);
      const info = await stat(full);
      if (info.isDirectory() && now.getTime() - info.mtimeMs > retentionDays * DAY) {
        await rm(full, { recursive: true, force: true });
      }
    }
    return { exitCode: EXIT_OK };
  } catch (error) {
    console.error("backup failed:", error);
    return { exitCode: EXIT_ERROR };
  }
}
