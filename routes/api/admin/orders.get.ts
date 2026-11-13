import { defineHandler, getQuery, HTTPError } from "nitro/h3";

import { requireAdministrator } from "../../../server/admin/auth";
import { readOrdersByStatus } from "../../../server/admin/orders";

// GETORDERS: the orders in one status (exact match) with their count.
export default defineHandler((event) => {
  requireAdministrator(event);
  const { status } = getQuery(event);
  if (typeof status !== "string" || status === "") {
    throw new HTTPError({ status: 400, message: "status is required" });
  }
  return readOrdersByStatus(status);
});
