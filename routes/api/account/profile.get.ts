import { defineHandler } from "nitro/h3";

import { formFromCustomer, requireSignedOn } from "../../../server/customer/http";
import { getCustomer } from "../../../server/customer/repository";

// The signed-on customer's saved contact, to pre-fill checkout. 401 when signed out.
export default defineHandler(async (event) => {
  const customer = await getCustomer(requireSignedOn(event));
  if (!customer) return {};
  const { lastName, firstName, address1, address2, city, state, postalCode, phone, email } =
    formFromCustomer(customer);
  return { lastName, firstName, address1, address2, city, state, postalCode, phone, email };
});
