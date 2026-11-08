// Shared fixtures for the order-notifications acceptance tests.
export type Sent = {
  to: string[];
  from: string;
  subject: string;
  contentType: string;
  body: string;
};

export const mailXml = (
  address = "al@example.com",
  subject = "Hello",
  content = "<p>Body</p>",
  order: ("Address" | "Subject" | "Content")[] = ["Address", "Subject", "Content"],
): string => {
  const values = { Address: address, Subject: subject, Content: content };
  const inner = order.map((n) => `<${n}>${values[n]}</${n}>`).join("");
  return `<?xml version="1.0"?><!DOCTYPE Mail SYSTEM "Mail.dtd"><Mail>${inner}</Mail>`;
};

// Recording transport; `fail` makes every send reject like an unreachable mail server.
export function recordingTransport(fail = false) {
  const sent: Sent[] = [];
  return {
    sent,
    send: async (m: Sent): Promise<void> => {
      if (fail) throw new Error("connect ECONNREFUSED");
      sent.push(m);
    },
  };
}

export const order = (over: Record<string, unknown> = {}) => ({
  orderId: "1001",
  locale: "en_US",
  email: "al@example.com",
  status: "APPROVED",
  ...over,
});

export const enabledSettings = {
  sendApprovalMail: true,
  sendConfirmationMail: true,
  sendCompletedOrderMail: true,
};
