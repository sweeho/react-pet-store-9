import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import { advanceClock } from "../../../server/customer/auth";
import { adminSignOn } from "../../../server/admin/auth";
import launch from "./launch.post";
import orders from "./orders.get";
import sales from "./sales.get";
import updateStatus from "./update-status.post";

const call = (handler: (e: H3Event) => unknown, sessionId: string, url: string, body?: unknown) => {
  const event = new H3Event(
    new Request(`http://shop.test:8443${url}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  event.context.sessionId = sessionId;
  return Promise.resolve().then(() => handler(event));
};

describe("admin order routes", () => {
  it("answers 401 without an admin sign-on and 403 for a non-administrator", async () => {
    await expect(call(orders, "r-none", "/api/admin/orders?status=PENDING")).rejects.toMatchObject({
      status: 401,
    });
    await adminSignOn("r-cust", "customer", "customer-password");
    await expect(call(orders, "r-cust", "/api/admin/orders?status=PENDING")).rejects.toMatchObject({
      status: 403,
    });
  });

  it("lists orders with a count, queues an update and totals sales for an administrator", async () => {
    await adminSignOn("r-adm", "jps_admin", "admin");
    const listed = (await call(orders, "r-adm", "/api/admin/orders?status=PENDING")) as {
      orders: unknown[];
      count: number;
    };
    expect(listed.count).toBe(listed.orders.length);
    expect(await call(updateStatus, "r-adm", "/api/admin/update-status", { orders: [] })).toEqual({
      result: "SUCCESS",
    });
    const totals = (await call(
      sales,
      "r-adm",
      "/api/admin/sales?type=REVENUE&start=2000-01-01&end=2100-01-01",
    )) as { totals: { total: number }[]; total: number };
    expect(Array.isArray(totals.totals)).toBe(true);
    expect(totals.total).toBeCloseTo(
      totals.totals.reduce((sum, t) => sum + t.total, 0),
      2,
    );
    await expect(call(sales, "r-adm", "/api/admin/sales?type=REVENUE")).rejects.toMatchObject({
      status: 400,
    });
  });

  it("returns the launch descriptor for manageorders and signs off on logout", async () => {
    await adminSignOn("r-launch", "jps_admin", "admin");
    const r = (await call(launch, "r-launch", "/api/admin/launch", { action: "manageorders" })) as {
      kind: string;
      descriptor: string;
    };
    expect(JSON.parse(r.descriptor)).toMatchObject({
      host: "shop.test",
      port: 8443,
      sessionId: "r-launch",
    });
    expect(await call(launch, "r-launch", "/api/admin/launch", { action: "logout" })).toEqual({
      kind: "logout-page",
    });
    await expect(
      call(orders, "r-launch", "/api/admin/orders?status=PENDING"),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("drops an administrator sign-on idle for 54 minutes", async () => {
    await adminSignOn("r-idle", "jps_admin", "admin");
    advanceClock("r-idle", 54);
    await expect(call(orders, "r-idle", "/api/admin/orders?status=PENDING")).rejects.toMatchObject({
      status: 401,
    });
  });
});
