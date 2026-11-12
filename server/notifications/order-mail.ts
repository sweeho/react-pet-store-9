// Order-status mail triggers (change swhr8-i-0009, design N4-N6).
import { produceOrderMail } from "../localization/mail";
import { escapeXml, type MailLog, type MailTransport } from "./mailer";
import { renderMail } from "./templates";

export const ORDER_STATUS_MAIL_QUEUE = "order-status-mail";
export const MAIL_QUEUE = "mail";

export type OrderEvent = "received" | "approved" | "denied" | "shipped" | "completed";
export const ORDER_EVENTS: readonly OrderEvent[] = [
  "received",
  "approved",
  "denied",
  "shipped",
  "completed",
];

export interface NotificationSettings {
  sendApprovalMail: boolean;
  sendConfirmationMail: boolean;
  sendCompletedOrderMail: boolean;
}

export const defaultNotificationSettings = (): NotificationSettings => ({
  sendApprovalMail: false,
  sendConfirmationMail: false,
  sendCompletedOrderMail: false,
});

/** Deployment switches; only the exact string "true" enables one (design N4). */
export function notificationSettings(env: NodeJS.ProcessEnv = process.env): NotificationSettings {
  return {
    sendApprovalMail: env.SEND_APPROVAL_MAIL === "true",
    sendConfirmationMail: env.SEND_CONFIRMATION_MAIL === "true",
    sendCompletedOrderMail: env.SEND_COMPLETED_ORDER_MAIL === "true",
  };
}

export const orderEventDocument = (orderId: string, event: OrderEvent): string =>
  `<OrderEvent><OrderId>${escapeXml(orderId)}</OrderId><Event>${event}</Event></OrderEvent>`;

const SUBJECT_PREFIX = {
  approved: "Java Pet Store Order Status: ",
  denied: "Java Pet Store Order Status: ",
  shipped: "Java Pet Store Order Shipped: ",
  completed: "Java Pet Store Order COMPLETED: ",
} as const;

const enabled = (event: OrderEvent, s: NotificationSettings): boolean =>
  event === "approved" || event === "denied"
    ? s.sendApprovalMail
    : event === "completed"
      ? s.sendCompletedOrderMail
      : s.sendConfirmationMail;

const consoleLog: MailLog = { error: (...a) => console.error(...a) };

/** Sends the mail for an order event only when its switch is on (R-0157). */
export async function notifyOrderEvent(args: {
  event: OrderEvent;
  order: { orderId: string; locale: string; email?: string | null };
  settings: NotificationSettings;
  transport: MailTransport;
  sender: string;
  log?: MailLog;
}): Promise<void> {
  const { event, order, settings, transport, sender } = args;
  // `received` is gated but defines no mail (design SD2).
  if (event === "received" || !enabled(event, settings)) return;
  const to = order.email?.trim();
  if (!to) return;
  let stylesheet: string;
  try {
    stylesheet = (await produceOrderMail({ order })).stylesheet;
  } catch (err) {
    (args.log ?? consoleLog).error(`No order mail for order ${order.orderId}`, err);
    return;
  }
  await transport.send({
    to: [to],
    from: sender,
    subject: `${SUBJECT_PREFIX[event]}${order.orderId}`,
    contentType: "text/html; charset=utf-8",
    body: renderMail(stylesheet, { orderId: order.orderId, event }),
    template: stylesheet,
  });
}
