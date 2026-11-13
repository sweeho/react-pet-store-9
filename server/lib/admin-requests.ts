// One request-type relay (design M3, M4). Reads and sales are served by their routes; this module
// owns the error replies and the UPDATESTATUS hand-off.
export interface OrderEntry {
  orderId?: string;
  status?: string;
}
export interface RelayReply {
  kind: "response" | "error";
  message: string;
}
export type PublishDecisions = (message: {
  orders: { orderId: string; status: string }[];
}) => Promise<void>;

const REQUEST_TYPES = new Set(["GETORDERS", "UPDATESTATUS", "REVENUE", "ORDERS"]);

export async function handleOrderServiceRequest(args: {
  type: string;
  session: { id: string } | null;
  orders?: OrderEntry[];
  publish?: PublishDecisions;
}): Promise<RelayReply> {
  const { type, session, orders = [], publish } = args;
  if (!session) {
    return { kind: "error", message: "Your session timed out. Please log in again." };
  }
  if (!REQUEST_TYPES.has(type)) {
    return { kind: "error", message: `Unknown request type - ${type}` };
  }
  if (type === "UPDATESTATUS") {
    // Entries lacking an id or a status are dropped; statuses are not validated.
    const kept = orders.flatMap((o) =>
      o.orderId && o.status ? [{ orderId: o.orderId, status: o.status }] : [],
    );
    await publish?.({ orders: kept });
  }
  return { kind: "response", message: type === "UPDATESTATUS" ? "SUCCESS" : type };
}
