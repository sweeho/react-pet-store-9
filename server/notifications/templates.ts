// Per-locale HTML mail bodies, keyed by the stylesheet name from produceOrderMail (design N6).
import { escapeXml as esc } from "./mailer";

export interface MailValues {
  orderId: string;
  event: string;
}

const TEXT: Record<string, Record<string, (id: string) => [string, string]>> = {
  "mail_en_US.xsl": {
    approved: (id) => ["Order Status", `Your order ${id} has been approved.`],
    denied: (id) => ["Order Status", `Your order ${id} has been denied.`],
    shipped: (id) => ["Order Shipped", `Your order ${id} has shipped.`],
    completed: (id) => ["Order Completed", `Your order ${id} is complete.`],
  },
  "mail_ja_JP.xsl": {
    approved: (id) => ["ご注文状況", `ご注文 ${id} は承認されました。`],
    denied: (id) => ["ご注文状況", `ご注文 ${id} は拒否されました。`],
    shipped: (id) => ["ご注文の発送", `ご注文 ${id} を発送しました。`],
    completed: (id) => ["ご注文完了", `ご注文 ${id} は完了しました。`],
  },
  "mail_zh_CN.xsl": {
    approved: (id) => ["订单状态", `您的订单 ${id} 已获批准。`],
    denied: (id) => ["订单状态", `您的订单 ${id} 已被拒绝。`],
    shipped: (id) => ["订单已发货", `您的订单 ${id} 已发货。`],
    completed: (id) => ["订单已完成", `您的订单 ${id} 已完成。`],
  },
};

/** Renders the HTML body; every interpolated value is escaped. */
export function renderMail(stylesheet: string, values: MailValues): string {
  const text = TEXT[stylesheet]?.[values.event];
  if (!text) throw new Error(`No mail template ${stylesheet} for event ${values.event}`);
  const [heading, line] = text(values.orderId);
  return `<html><body><h1>${esc(heading)}</h1><p>${esc(line)}</p></body></html>`;
}
