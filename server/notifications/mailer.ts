// Mail request intake and delivery (change swhr8-i-0009, design N1-N3).

export interface OutgoingMail {
  to: string[];
  from: string;
  subject: string;
  contentType: string;
  body: string;
  /** Stylesheet name the body was rendered from, when there is one. */
  template?: string;
}
export interface MailTransport {
  send(mail: OutgoingMail): Promise<void>;
}
export interface MailLog {
  error(...args: unknown[]): void;
}
export interface Mail {
  address: string;
  subject: string;
  content: string;
}

const unescapeXml = (v: string): string =>
  v
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

export const escapeXml = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const MAIL =
  /^<Mail>\s*<Address>([\s\S]*?)<\/Address>\s*<Subject>([\s\S]*?)<\/Subject>\s*<Content>([\s\S]*)<\/Content>\s*<\/Mail>$/;

/** Parses a Mail document; Address, Subject, Content in that order. Content is raw inner markup. */
export function parseMail(xml: string): Mail | undefined {
  const body = xml
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .trim();
  const m = MAIL.exec(body);
  return m
    ? { address: unescapeXml(m[1]).trim(), subject: unescapeXml(m[2]), content: m[3] }
    : undefined;
}

export const validateMail = (xml: string): { valid: boolean } => ({
  valid: parseMail(xml) !== undefined,
});

/** Sends the mail as text/html from `sender`, one send per comma-separated recipient. */
export async function sendMail(args: {
  mail: Mail;
  transport: MailTransport;
  sender: string;
  now?: Date;
}): Promise<void> {
  const { mail, transport, sender } = args;
  const recipients = mail.address
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  for (const to of recipients) {
    await transport.send({
      to: [to],
      from: sender,
      subject: mail.subject,
      contentType: "text/html; charset=utf-8",
      body: mail.content,
    });
  }
}

/**
 * A malformed request rejects and sends nothing. A delivery failure is logged and dropped:
 * the call resolves and the transport is not retried (R-0155).
 */
export async function processMailRequest(args: {
  message: string;
  transport: MailTransport;
  log: MailLog;
  sender: string;
}): Promise<void> {
  const mail = parseMail(args.message);
  if (!mail) throw new Error("Invalid mail request: Address, Subject, Content expected");
  try {
    await sendMail({ mail, transport: args.transport, sender: args.sender });
  } catch (err) {
    args.log.error("Mail delivery failed", err);
  }
}
