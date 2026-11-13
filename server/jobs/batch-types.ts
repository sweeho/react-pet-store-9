// Plain data shapes shared by the order batch jobs (design B1).
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

/** Exit codes of every batch job: 0 ok, 4 found something, 8 error. */
export const EXIT_OK = 0;
export const EXIT_FOUND = 4;
export const EXIT_ERROR = 8;

export const yyyymmdd = (d: Date): string =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** Sends a mail without ever throwing: a failed send is logged and dropped. */
export async function safeNotify(notify: Notify, mail: BatchMail): Promise<void> {
  try {
    await notify(mail);
  } catch (error) {
    console.error(`mail to ${mail.to} failed:`, error);
  }
}
