export interface OrderEntry {
  orderId?: string;
  status?: string;
}
export interface RelayReply {
  kind: "response" | "error";
  message: string;
}
export function handleOrderServiceRequest(_args: {
  type: string;
  session: { id: string } | null;
  orders?: OrderEntry[];
  publish?: (message: { orders: { orderId: string; status: string }[] }) => Promise<void>;
}): Promise<RelayReply> {
  throw new Error('VortexNotImplemented');
}
