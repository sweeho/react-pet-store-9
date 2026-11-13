import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { eq } from "drizzle-orm";

import { replaceCatalog, type CatalogSeed } from "./catalog-seed";
import { resetSampleCustomers, seedCustomers } from "./customer-seed";
import catalogSeed from "./seed/catalog.json";
import * as schema from "./schema";
import { category, signonUser, users } from "./schema";

type Db = BunSQLiteDatabase<typeof schema>;

const demoUsers = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
];

const sampleSignOns = ["j2ee", "shopper", "jps_admin", "customer"];

/**
 * Loads the sample catalog, customers and users. Not forced: loads only what is missing.
 * Forced: reloads the catalog and resets the sample users to their sample values; other
 * customers and all orders are untouched. Returns whether anything was (re)loaded.
 */
export function loadSampleData(db: Db, opts: { force: boolean }): boolean {
  if (opts.force) {
    replaceCatalog(db, catalogSeed as CatalogSeed);
    for (const u of demoUsers) {
      db.insert(users)
        .values(u)
        .onConflictDoUpdate({ target: users.email, set: { name: u.name } })
        .run();
    }
    resetSampleCustomers(db);
    return true;
  }
  let loaded = false;
  if (db.select().from(users).all().length === 0) {
    db.insert(users).values(demoUsers).run();
    loaded = true;
  }
  if (db.select().from(category).all().length === 0) {
    replaceCatalog(db, catalogSeed as CatalogSeed);
    loaded = true;
  }
  const present = sampleSignOns.filter(
    (n) => db.select().from(signonUser).where(eq(signonUser.userName, n)).get() !== undefined,
  );
  if (present.length < sampleSignOns.length) {
    seedCustomers(db);
    loaded = true;
  }
  return loaded;
}
