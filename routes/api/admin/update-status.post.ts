import { defineHandler, readBody } from "nitro/h3";

import { requireAdministrator } from "../../../server/admin/auth";
import { publishDecisions } from "../../../server/admin/orders";
import { handleOrderServiceRequest, type OrderEntry } from "../../../server/lib/admin-requests";

// UPDATESTATUS: hands the decisions to order processing as one queued OrderApproval message.
export default defineHandler(async (event) => {
  requireAdministrator(event);
  const body = (await readBody<{ orders?: unknown }>(event).catch(() => undefined)) ?? {};
  const orders = Array.isArray(body.orders) ? (body.orders as OrderEntry[]) : [];
  const reply = await handleOrderServiceRequest({
    type: "UPDATESTATUS",
    session: { id: event.context.sessionId as string },
    orders,
    publish: publishDecisions,
  });
  return { result: reply.message };
});
