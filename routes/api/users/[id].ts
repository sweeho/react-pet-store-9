import { createError, defineHandler, getRouterParam } from "nitro/h3";

import { getSignOnUser } from "../../../server/customer/repository";

// Whether a sign-on user exists: 200 with the user name, or 404.
export default defineHandler(async (event) => {
  const user = await getSignOnUser(getRouterParam(event, "id") ?? "");
  if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });
  return user;
});
