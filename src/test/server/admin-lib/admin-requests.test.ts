// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { handleOrderServiceRequest } from "../../../../server/lib/admin-requests";

const session = { id: "sess-42" };
const sent = (publish: ReturnType<typeof vi.fn>) =>
  (publish.mock.calls[0][0] as { orders: unknown[] }).orders;

describe("admin request relay", () => {
  // case: SWHR8-C-0253@v1
  it("[SWHR8-C-0253] an unknown type replies 'Unknown request type - FOO'", async () => {
    const r = await handleOrderServiceRequest({ type: "FOO", session });
    expect(r).toEqual({ kind: "error", message: "Unknown request type - FOO" });
  });

  // case: SWHR8-C-0254@v1
  it("[SWHR8-C-0254] no session says the session timed out and to log in again", async () => {
    const r = await handleOrderServiceRequest({ type: "GETORDERS", session: null });
    expect(r.kind).toBe("error");
    expect(r.message).toMatch(/session timed out/i);
    expect(r.message).toMatch(/log in again/i);
  });

  // case: SWHR8-C-0263@v1
  it("[SWHR8-C-0263] three complete pairs publish one message and reply SUCCESS", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const orders = [
      { orderId: "1", status: "APPROVED" },
      { orderId: "2", status: "APPROVED" },
      { orderId: "3", status: "DENIED" },
    ];
    const r = await handleOrderServiceRequest({ type: "UPDATESTATUS", session, orders, publish });
    expect(publish).toHaveBeenCalledTimes(1);
    expect(sent(publish)).toEqual(orders);
    expect(r).toEqual({ kind: "response", message: "SUCCESS" });
  });

  // case: SWHR8-C-0264@v1
  it("[SWHR8-C-0264] an entry lacking a status is omitted without an error", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const r = await handleOrderServiceRequest({
      type: "UPDATESTATUS",
      session,
      orders: [{ orderId: "1", status: "APPROVED" }, { orderId: "2" }],
      publish,
    });
    expect(r.kind).toBe("response");
    expect(sent(publish)).toEqual([{ orderId: "1", status: "APPROVED" }]);
  });

  // case: SWHR8-C-0269@v1
  it("[SWHR8-C-0269] two orders send one async message and reply SUCCESS", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const r = await handleOrderServiceRequest({
      type: "UPDATESTATUS",
      session,
      orders: [
        { orderId: "10", status: "APPROVED" },
        { orderId: "11", status: "DENIED" },
      ],
      publish,
    });
    expect(publish).toHaveBeenCalledTimes(1);
    expect(sent(publish)).toHaveLength(2);
    expect(r.message).toBe("SUCCESS");
  });

  // case: SWHR8-C-0270@v1
  it("[SWHR8-C-0270] entries missing an id or status are dropped; statuses are not validated", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const r = await handleOrderServiceRequest({
      type: "UPDATESTATUS",
      session,
      orders: [{ status: "APPROVED" }, { orderId: "2" }, { orderId: "3", status: "WHATEVER" }],
      publish,
    });
    expect(r.kind).toBe("response");
    expect(sent(publish)).toEqual([{ orderId: "3", status: "WHATEVER" }]);
  });
});
