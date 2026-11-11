import { defineHandler } from "nitro/h3";

import { messagesFor } from "../../../server/checkout/queue";

// The XML purchase orders the calling session has sent to order processing. Never across sessions.
export default defineHandler((event) => ({
  messages: messagesFor(event.context.sessionId as string),
}));
