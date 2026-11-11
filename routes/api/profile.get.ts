import { defineHandler } from "nitro/h3";

import { requireSignedOn } from "../../server/customer/http";
import { createProfile } from "../../server/customer/model";
import { getCustomer } from "../../server/customer/repository";

// The signed-on customer's profile: language, favorite category, my-list and banner.
export default defineHandler(async (event) => {
  const customer = await getCustomer(requireSignedOn(event));
  const { language, favoriteCategory, myList, banner } = customer?.profile ?? createProfile();
  return { language, favoriteCategory, myList, banner };
});
