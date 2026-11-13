import { defineHandler } from "nitro/h3";

import { adminSignOff } from "../../../server/admin/auth";

export default defineHandler((event) => {
  adminSignOff(event.context.sessionId as string);
  return { signedOn: false };
});
