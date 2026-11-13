/* eslint-disable @typescript-eslint/no-unused-vars -- red-phase stub */
import type { BatchOrder } from "./order-extract";

export interface PurgeOrder extends BatchOrder {
  contactId?: string;
  addressId?: string;
  cardId?: string;
}

export interface PurgeStore {
  orders: PurgeOrder[];
  orderLines: { orderId: string }[];
  orderManager: { orderId: string }[];
  supplierOrders: { id: string; orderId: string; status: string }[];
  supplierLineItems: { supplierOrderId: string }[];
  contacts: { id: string }[];
  addresses: { id: string }[];
  cards: { id: string }[];
}

export function selectPurgeable<T extends BatchOrder>(_input: {
  orders: T[];
  now: Date;
  retentionDays?: number;
}): T[] {
  throw new Error("VortexNotImplemented");
}

export async function runOrderPurge(_input: {
  store: PurgeStore;
  now: Date;
  retentionDays?: number;
}): Promise<{ exitCode: number; purgedOrderIds: string[]; transactions: number }> {
  throw new Error("VortexNotImplemented");
}
