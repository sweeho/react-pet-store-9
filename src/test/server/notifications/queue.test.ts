// @vitest-environment node
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

import { db } from "../../../../db/client";
import { queueMessage } from "../../../../db/schema";
import { drainApprovalQueue } from "../../../../server/approval/queue";
import { placeOrder, receiveOrderMessage } from "../../../../server/checkout/service";
import { parseMail } from "../../../../server/notifications/mailer";
import { notificationSettings } from "../../../../server/notifications/order-mail";
import { drainMailQueue, drainStatusMailQueue } from "../../../../server/notifications/queue";
import { renderMail } from "../../../../server/notifications/templates";

const contact = {
  lastName: "Ice",
  firstName: "Al",
  address1: "1 Main",
  city: "Town",
  state: "CA",
  postalCode: "90000",
  phone: "555",
  email: "bill@example.com",
};

async function approvedOrder(locale = "en_US"): Promise<string> {
  const delivered: string[] = [];
  const order = await placeOrder({
    userId: "alice",
    locale,
    cart: [{ categoryId: "F", productId: "P", itemId: "I", quantity: 1, unitCost: 25 }],
    billing: contact,
    shipping: contact,
    queue: { deliver: (t) => void delivered.push(t) },
  });
  await receiveOrderMessage(delivered[0]);
  await drainApprovalQueue();
  return order.orderId;
}

const rows = (queue: string) =>
  db.select().from(queueMessage).where(eq(queueMessage.queue, queue)).all();

afterEach(() => vi.unstubAllEnvs());

describe("mail parsing", () => {
  it("keeps raw HTML content and unescapes address and subject", () => {
    const mail = parseMail(
      '<?xml version="1.0"?><!DOCTYPE Mail SYSTEM "Mail.dtd"><Mail><Address>a@b.c</Address><Subject>A &amp; B</Subject><Content><p>x<b>y</b></p></Content></Mail>',
    );
    expect(mail).toEqual({ address: "a@b.c", subject: "A & B", content: "<p>x<b>y</b></p>" });
  });
  it("rejects a missing element and a wrong root", () => {
    expect(parseMail("<Mail><Address>a</Address><Subject>s</Subject></Mail>")).toBeUndefined();
    expect(parseMail("<Item><Address>a</Address></Item>")).toBeUndefined();
  });
  it("escapes values in templates", () => {
    expect(renderMail("mail_en_US.xsl", { orderId: "<1>", event: "approved" })).toContain(
      "&lt;1&gt;",
    );
  });
});

describe("notification drains", () => {
  it("default configuration publishes the event but queues no mail", async () => {
    const id = await approvedOrder();
    const events = rows("order-status-mail").filter((r) =>
      r.body.includes(`<OrderId>${id}</OrderId>`),
    );
    expect(events).toHaveLength(1);
    expect(rows("order-decision").some((r) => r.body.includes(`<OrderId>${id}</OrderId>`))).toBe(
      true,
    );
    const before = rows("mail").length;
    await drainStatusMailQueue();
    expect(rows("mail").length).toBe(before);
  });

  it("an enabled approval queues exactly one mail; a delivery failure is consumed", async () => {
    vi.stubEnv("SEND_APPROVAL_MAIL", "true");
    expect(notificationSettings().sendApprovalMail).toBe(true);
    const id = await approvedOrder();
    const before = rows("mail").length;
    await drainStatusMailQueue();
    const added = rows("mail").slice(before);
    expect(added).toHaveLength(1);
    expect(added[0].body).toContain(`Java Pet Store Order Status: ${id}`);
    expect(added[0].body).toContain("bill@example.com");
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await drainMailQueue();
    expect(err).toHaveBeenCalled();
    expect(rows("mail").every((r) => r.status === "delivered")).toBe(true);
  });

  it("a malformed mail request stays queued", async () => {
    db.insert(queueMessage)
      .values({ queue: "mail", body: "<Mail/>", status: "queued", createdAt: new Date() })
      .run();
    await drainMailQueue();
    expect(rows("mail").some((r) => r.body === "<Mail/>" && r.status === "queued")).toBe(true);
  });
});
