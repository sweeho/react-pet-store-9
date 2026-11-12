// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  enabledSettings,
  order,
  recordingTransport,
} from "../../../../tests/acceptance/order-notifications/helpers";

// Assumed module boundary: server/notifications/order-mail.ts exports
//   defaultNotificationSettings(): { sendApprovalMail; sendConfirmationMail; sendCompletedOrderMail }  (all false)
//   notifyOrderEvent({ event, order, settings, transport, sender }): Promise<void>
//     event: "received" | "approved" | "completed". Sends the matching mail only when its setting is true:
//       received -> sendConfirmationMail, approved -> sendApprovalMail, completed -> sendCompletedOrderMail.
//     Approved subject "Java Pet Store Order Status: <orderId>", sent to order.email,
//     body rendered from the locale template (order.locale, e.g. "en_US"); the sent message carries `template`.
//   transport: { send(m: { to; from; subject; contentType; body; template? }): Promise<void> }
const mod = () => import("../../../../server/notifications/order-mail");
const sender = "petstore@example.com";

describe("order status notifications", () => {
  // case: SWHR8-C-0110@v1
  it("[SWHR8-C-0110] the default configuration sends no order-status mail for an order event", async () => {
    const { notifyOrderEvent, defaultNotificationSettings } = await mod();
    const transport = recordingTransport();
    await notifyOrderEvent({
      event: "approved",
      order: order(),
      settings: defaultNotificationSettings(),
      transport,
      sender,
    });
    expect(transport.sent).toHaveLength(0);
  });

  // case: SWHR8-C-0112@v1
  it("[SWHR8-C-0112] completing an order sends no completion mail when that setting is disabled", async () => {
    const { notifyOrderEvent } = await mod();
    const transport = recordingTransport();
    await notifyOrderEvent({
      event: "completed",
      order: order({ status: "COMPLETED" }),
      settings: { ...enabledSettings, sendCompletedOrderMail: false },
      transport,
      sender,
    });
    expect(transport.sent).toHaveLength(0);
  });

  // case: SWHR8-C-0113@v1
  it("[SWHR8-C-0113] under the default configuration receiving, approving and completing send nothing", async () => {
    const { notifyOrderEvent, defaultNotificationSettings } = await mod();
    const transport = recordingTransport();
    const settings = defaultNotificationSettings();
    for (const event of ["received", "approved", "completed"] as const) {
      await notifyOrderEvent({ event, order: order(), settings, transport, sender });
    }
    expect(settings).toEqual({
      sendApprovalMail: false,
      sendConfirmationMail: false,
      sendCompletedOrderMail: false,
    });
    expect(transport.sent).toHaveLength(0);
  });

  // case: SWHR8-C-0116@v1
  it("[SWHR8-C-0116] an approved en_US order mails the purchase-order e-mail with the status subject and en_US template", async () => {
    const { notifyOrderEvent } = await mod();
    const transport = recordingTransport();
    await notifyOrderEvent({
      event: "approved",
      order: order({ orderId: "1001", locale: "en_US", email: "po@example.com" }),
      settings: enabledSettings,
      transport,
      sender,
    });
    expect(transport.sent).toHaveLength(1);
    const [m] = transport.sent as ((typeof transport.sent)[number] & { template?: string })[];
    expect(m.subject).toBe("Java Pet Store Order Status: 1001");
    expect(m.to).toEqual(["po@example.com"]);
    expect(m.template).toMatch(/en_US/);
  });
});
