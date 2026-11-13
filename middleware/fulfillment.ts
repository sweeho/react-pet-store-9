import { defineHandler } from "nitro/h3";

// Loads the fulfilment drains when the server starts, so approved orders are fulfilled without
// waiting for a request that happens to import them (change swhr8-i-0010, design F3).
import "../server/fulfillment/queue";

export default defineHandler(() => undefined);
