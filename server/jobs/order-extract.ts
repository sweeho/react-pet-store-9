/* eslint-disable @typescript-eslint/no-unused-vars -- red-phase stub */
export type BatchOrderStatus = "PENDING" | "APPROVED" | "COMPLETED" | "DENIED" | (string & {});

export interface BatchOrder {
  orderId: string;
  userName: string;
  orderTime: Date;
  locale: string;
  value: number;
  lineCount: number;
  status: BatchOrderStatus;
}

export interface BatchMail {
  to: string;
  subject: string;
  body: string;
}

export type Notify = (mail: BatchMail) => Promise<void>;

export async function runOrderExtract(_input: {
  orders: BatchOrder[];
  outDir: string;
  now: Date;
  notify: Notify;
  mailFinance?: string;
}): Promise<{ file: string; exitCode: number }> {
  throw new Error("VortexNotImplemented");
}
