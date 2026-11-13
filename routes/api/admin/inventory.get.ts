import { defineHandler } from "nitro/h3";

import { requireAdministrator } from "../../../server/admin/auth";
import { listInventoryItems } from "../../../server/admin/repository";

export default defineHandler((event) => {
  requireAdministrator(event);
  return { items: listInventoryItems() };
});
