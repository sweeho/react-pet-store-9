# Summary — SWHR8-T-0034 Customer notifications

Order-status e-mails (approved/denied, shipped, completed), each behind a default-off env switch, in the order's locale, to the bill-to e-mail, queued as Mail documents and sent as HTML. No routes or pages.

- `server/notifications/mailer.ts`: local Mail parser, `validateMail`, `sendMail` (one send per recipient), `processMailRequest` (malformed rejects; delivery failure logged and dropped).
- `order-mail.ts`: settings (`SEND_APPROVAL_MAIL`, `SEND_CONFIRMATION_MAIL`, `SEND_COMPLETED_ORDER_MAIL`), `notifyOrderEvent`, subjects. `received` is gated but sends nothing (SD2).
- `templates.ts`: en_US/ja_JP/zh_CN HTML, escaped. `transport.ts`: nodemailer SMTP (`MAIL_SMTP_URL`, `MAIL_SENDER`); unset URL rejects. `queue.ts`: `order-status-mail` drain (writes Mail rows on `mail`) and `mail` drain.
- `server/approval/queue.ts`: drain's `send` also publishes an OrderEvent on `order-status-mail` in the same transaction; `order-decision` unchanged.
- `package.json`, `bun.lock`: nodemailer + types.
- Tests in `src/test/server/notifications/`.

Deviation: approval/queue and notifications/queue import each other (function-level use only); a dynamic import caused undefined exports under Vitest.
C-0108 locked e2e test disputed per SD1 (it needs `POST /api/orders`, which this app must not add).
Verification: `bun run verify` passed (311 tests). E2E not run: no UI change.
CODE-REVIEW: self-review — server-only change; checked transactional fan-out, malformed vs failed delivery handling, escaping.
