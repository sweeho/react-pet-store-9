import { isRecognisedStatus } from "../approval/service";

/** Sets the status; a name outside PENDING, APPROVED, DENIED, SHIPPED_PART, COMPLETED is refused. */
export function setOrderStatus(order: { status: string }, status: string): void {
  if (!isRecognisedStatus(status)) throw new Error(`Unrecognised order status: ${status}`);
  order.status = status;
}
