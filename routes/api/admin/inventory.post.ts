import { defineHandler, HTTPError, readBody } from "nitro/h3";

import { requireAdministrator } from "../../../server/admin/auth";
import { saveInventory } from "../../../server/admin/inventory";

// Sets stock; blank, negative and non-numeric entries are ignored. Waiting supplier orders are
// re-attempted in the same transaction.
export default defineHandler(async (event) => {
  requireAdministrator(event);
  const body = (await readBody<{ quantities?: unknown }>(event).catch(() => undefined)) ?? {};
  const { quantities } = body;
  if (typeof quantities !== "object" || quantities === null || Array.isArray(quantities)) {
    throw new HTTPError({ status: 400, message: "quantities must be an object" });
  }
  return saveInventory(quantities as Record<string, unknown>);
});
