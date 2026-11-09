// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

// Assumed module boundaries:
// server/lib/admin-requests.ts exports
//   handleOrderServiceRequest({ type, session, orders?, publish? }):
//     Promise<{ kind: "response" | "error"; message: string }>
//   (session is null when the request has no session; publish(message) is the async queue sender;
//    orders: { orderId?: string; status?: string }[] for type UPDATESTATUS)
// server/lib/admin-launcher.ts exports
//   handleAdminAction({ action?, session, host, port }):
//     { kind: "launch"; descriptor: string } | { kind: "logout-page" } | { kind: "empty" }
// server/lib/admin-session.ts exports
//   createAdminSession(): { id: string }
//   isAdminSessionExpired(session, now?: Date): boolean   (inactivity measured from creation/last use)
const loadRequests = () => import("../../../server/lib/admin-requests");
const loadLauncher = () => import("../../../server/lib/admin-launcher");
const loadSession = () => import("../../../server/lib/admin-session");

const session = { id: "sess-42" };

afterEach(() => vi.useRealTimers());

describe("admin request error replies", () => {
  // case: SWHR8-C-0253@v1
  it("[SWHR8-C-0253] unknown request type FOO yields an error 'Unknown request type - FOO'", async () => {
    const { handleOrderServiceRequest } = await loadRequests();

    const reply = await handleOrderServiceRequest({ type: "FOO", session });

    expect(reply.kind).toBe("error");
    expect(reply.message).toContain("Unknown request type - FOO");
  });

  // case: SWHR8-C-0254@v1
  it("[SWHR8-C-0254] a request with no session says the session timed out and to log in again", async () => {
    const { handleOrderServiceRequest } = await loadRequests();

    const reply = await handleOrderServiceRequest({ type: "GETORDERS", session: null });

    expect(reply.kind).toBe("error");
    expect(reply.message).toMatch(/session timed out/i);
    expect(reply.message).toMatch(/log ?in again/i);
  });
});

describe("administration launcher", () => {
  // case: SWHR8-C-0255@v1
  it("[SWHR8-C-0255] manage orders returns a launch descriptor naming host, port and session id", async () => {
    const { handleAdminAction } = await loadLauncher();

    const result = handleAdminAction({
      action: "manageorders",
      session,
      host: "shop.example.test",
      port: 8443,
    });

    expect(result.kind).toBe("launch");
    expect(result.descriptor).toContain("shop.example.test");
    expect(result.descriptor).toContain("8443");
    expect(result.descriptor).toContain("sess-42");
  });

  // case: SWHR8-C-0257@v1
  it("[SWHR8-C-0257] a request with no action parameter gets an empty response", async () => {
    const { handleAdminAction } = await loadLauncher();

    const result = handleAdminAction({ session, host: "h", port: 80 });

    expect(result).toEqual({ kind: "empty" });
  });
});

describe("administrator session expiry", () => {
  // case: SWHR8-C-0262@v1
  it("[SWHR8-C-0262] a session idle for 54 minutes is treated as expired", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T09:00:00Z"));
    const { createAdminSession, isAdminSessionExpired } = await loadSession();
    const s = createAdminSession();
    expect(isAdminSessionExpired(s)).toBe(false);

    vi.setSystemTime(new Date("2026-03-10T09:54:00Z"));

    expect(isAdminSessionExpired(s)).toBe(true);
  });
});

describe("approval decision publication", () => {
  // case: SWHR8-C-0263@v1
  it("[SWHR8-C-0263] three complete pairs publish one message with three orders and reply SUCCESS", async () => {
    const { handleOrderServiceRequest } = await loadRequests();
    const publish = vi.fn().mockResolvedValue(undefined);
    const orders = [
      { orderId: "1", status: "APPROVED" },
      { orderId: "2", status: "APPROVED" },
      { orderId: "3", status: "DENIED" },
    ];

    const reply = await handleOrderServiceRequest({
      type: "UPDATESTATUS",
      session,
      orders,
      publish,
    });

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish.mock.calls[0][0].orders).toEqual(orders);
    expect(reply.message).toContain("SUCCESS");
  });

  // case: SWHR8-C-0264@v1
  it("[SWHR8-C-0264] an entry lacking a status is omitted from the message without an error", async () => {
    const { handleOrderServiceRequest } = await loadRequests();
    const publish = vi.fn().mockResolvedValue(undefined);

    const reply = await handleOrderServiceRequest({
      type: "UPDATESTATUS",
      session,
      orders: [
        { orderId: "1", status: "APPROVED" },
        { orderId: "2" },
        { orderId: "3", status: "DENIED" },
      ],
      publish,
    });

    expect(reply.kind).not.toBe("error");
    expect(publish.mock.calls[0][0].orders.map((o: { orderId: string }) => o.orderId)).toEqual([
      "1",
      "3",
    ]);
  });

  // case: SWHR8-C-0269@v1
  it("[SWHR8-C-0269] update-status with two orders sends one async message and replies SUCCESS", async () => {
    const { handleOrderServiceRequest } = await loadRequests();
    const publish = vi.fn().mockResolvedValue(undefined);
    const orders = [
      { orderId: "10", status: "APPROVED" },
      { orderId: "11", status: "DENIED" },
    ];

    const reply = await handleOrderServiceRequest({
      type: "UPDATESTATUS",
      session,
      orders,
      publish,
    });

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish.mock.calls[0][0].orders).toHaveLength(2);
    expect(reply).toMatchObject({ kind: "response" });
    expect(reply.message).toContain("SUCCESS");
  });

  // case: SWHR8-C-0270@v1
  it("[SWHR8-C-0270] entries missing an id or a status are silently omitted; other statuses are not validated", async () => {
    const { handleOrderServiceRequest } = await loadRequests();
    const publish = vi.fn().mockResolvedValue(undefined);

    const reply = await handleOrderServiceRequest({
      type: "UPDATESTATUS",
      session,
      orders: [{ status: "APPROVED" }, { orderId: "2" }, { orderId: "3", status: "WHATEVER" }],
      publish,
    });

    expect(reply.kind).not.toBe("error");
    expect(publish.mock.calls[0][0].orders).toEqual([{ orderId: "3", status: "WHATEVER" }]);
  });
});
