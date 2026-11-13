import { defineHandler, getQuery } from "nitro/h3";

import { db } from "../../db/client";
import { loadSampleData } from "../../db/sample-data";
import { requireAdministrator } from "../../server/admin/auth";

// GET /api/populate?forcefully=<bool>: loads sample data when missing, or reloads it all when forced.
// Unauthenticated like the legacy servlet; in production a forced reload needs an administrator.
export default defineHandler((event): { reloaded: boolean } => {
  const force = getQuery(event).forcefully === "true";
  if (force && process.env.NODE_ENV === "production") requireAdministrator(event);
  return { reloaded: loadSampleData(db, { force }) };
});
