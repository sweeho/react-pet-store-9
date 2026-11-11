import { defineHandler } from "nitro/h3";

import { formFromCustomer, requireSignedOn } from "../../server/customer/http";
import { createProfile } from "../../server/customer/model";
import { getCustomer } from "../../server/customer/repository";

// The signed-on customer's form; a user who has not saved the customer form yet gets the defaults.
export default defineHandler(async (event) => {
  const userName = requireSignedOn(event);
  const customer = await getCustomer(userName);
  if (customer) return formFromCustomer(customer);
  return { userName, status: "active", ...createProfile() };
});
