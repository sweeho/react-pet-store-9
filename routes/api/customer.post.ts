import { defineHandler, readBody } from "nitro/h3";

import { requireSignedOn, saveCustomerForm } from "../../server/customer/http";

// Creates or replaces the signed-on customer's contact, address, card and preferences; a language
// is applied to the session at once. Unchecked checkboxes mean off.
export default defineHandler(async (event) => {
  const userName = requireSignedOn(event);
  const body = await readBody(event).catch(() => undefined);
  return saveCustomerForm(event, userName, body);
});
