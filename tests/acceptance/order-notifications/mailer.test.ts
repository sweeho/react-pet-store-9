// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { mailXml, recordingTransport } from "./helpers";

// Assumed module boundary: server/notifications/mailer.ts exports
//   validateMail(xml: string): { valid: boolean }       validates against the Mail DTD (Address, Subject, Content in order)
//   processMailRequest({ message, transport, log, sender }): Promise<void>
//     message: queued XML text. Malformed / DTD-violating => rejects (processing error), nothing sent.
//     Delivery failure (transport rejects) => log.error(...) called, resolves, no retry (transport.send called once).
//   sendMail({ mail: { address, subject, content }, transport, sender, now }): Promise<void>
//     address may be comma-separated; sends text/html to each recipient from `sender` with `subject`.
//   transport: { send(m: { to: string[]; from: string; subject: string; contentType: string; body: string }): Promise<void> }
const mod = () => import("../../../server/notifications/mailer");
const sender = "petstore@example.com";

describe("mail request intake", () => {
  // case: SWHR8-C-0109@v1
  it("[SWHR8-C-0109] a DTD-violating request raises a processing error and sends nothing", async () => {
    const { processMailRequest } = await mod();
    const transport = recordingTransport();
    const bad = mailXml("a@b.com", "S", "C", ["Subject", "Address", "Content"]);
    await expect(
      processMailRequest({ message: bad, transport, log: { error: vi.fn() }, sender }),
    ).rejects.toThrow();
    expect(transport.sent).toHaveLength(0);
  });

  // case: SWHR8-C-0115@v1
  it("[SWHR8-C-0115] a valid Address/Subject/Content request sends exactly one e-mail", async () => {
    const { processMailRequest } = await mod();
    const transport = recordingTransport();
    await processMailRequest({
      message: mailXml("a@b.com", "Subj", "<p>Hi</p>"),
      transport,
      log: { error: vi.fn() },
      sender,
    });
    expect(transport.sent).toHaveLength(1);
    expect(transport.sent[0].subject).toBe("Subj");
    expect(transport.sent[0].to).toEqual(["a@b.com"]);
  });

  // case: SWHR8-C-0117@v1
  it("[SWHR8-C-0117] a Mail document with Subject before Address is invalid", async () => {
    const { validateMail } = await mod();
    expect(
      validateMail(mailXml("a@b.com", "S", "C", ["Subject", "Address", "Content"])).valid,
    ).toBe(false);
    expect(validateMail(mailXml("a@b.com", "S", "C")).valid).toBe(true);
  });
});

describe("mail delivery", () => {
  // case: SWHR8-C-0111@v1
  it("[SWHR8-C-0111] sends text/html to every comma-separated recipient from the configured sender", async () => {
    const { sendMail } = await mod();
    const transport = recordingTransport();
    await sendMail({
      mail: { address: "a@x.com, b@x.com,c@x.com", subject: "Given subject", content: "<b>x</b>" },
      transport,
      sender,
      now: new Date(2026, 2, 12),
    });
    const recipients = transport.sent.flatMap((m) => m.to).sort();
    expect(recipients).toEqual(["a@x.com", "b@x.com", "c@x.com"]);
    for (const m of transport.sent) {
      expect(m.contentType).toMatch(/^text\/html/);
      expect(m.from).toBe(sender);
      expect(m.subject).toBe("Given subject");
    }
  });

  // case: SWHR8-C-0114@v1
  it("[SWHR8-C-0114] a failed delivery is logged, the message is consumed, no retry and no error", async () => {
    const { processMailRequest } = await mod();
    const failing = recordingTransport(true);
    const send = vi.spyOn(failing, "send");
    const log = { error: vi.fn() };
    await expect(
      processMailRequest({ message: mailXml(), transport: failing, log, sender }),
    ).resolves.toBeUndefined();
    expect(log.error).toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(1);
  });
});
