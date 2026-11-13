/* eslint-disable @typescript-eslint/no-unused-vars -- red-phase stub */
import type { BatchOrder, Notify } from "./order-extract";

export async function runAgingReport(_input: {
  orders: BatchOrder[];
  supplierOrders: { orderId: string; status: string }[];
  outDir: string;
  now: Date;
  notify: Notify;
  stuckHours?: number;
  mailOps?: string;
}): Promise<{ file: string; exitCode: number }> {
  throw new Error("VortexNotImplemented");
}
