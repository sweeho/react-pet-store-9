// @vitest-environment node
import { describe, expect, it } from "vitest";

import { runHealthCheck } from "../../../server/jobs/health-check";

const modules = { storefront: "http://h/", admin: "http://h/admin" };

describe("health check", () => {
  it("[SWHR8-C-0146] logs the admin module down and exits 8 on HTTP 503", async () => {
    const fetchStub = async (url: string | URL | Request) =>
      String(url).includes("admin") ? new Response("x", { status: 503 }) : new Response("ok");
    const result = await runHealthCheck({ modules, fetch: fetchStub });
    expect(result.down).toEqual(["admin"]);
    expect(result.log.some((l) => /admin/.test(l) && /DOWN/.test(l))).toBe(true);
    expect(result.exitCode).toBe(8);
  });

  it("exits 0 when every module answers 200", async () => {
    const result = await runHealthCheck({
      modules,
      fetch: async () => new Response("ok"),
    });
    expect(result).toMatchObject({ exitCode: 0, down: [] });
    expect(result.log).toEqual(["storefront UP", "admin UP"]);
  });

  it("treats a network error as down", async () => {
    const result = await runHealthCheck({
      modules,
      fetch: async () => {
        throw new Error("ECONNREFUSED");
      },
    });
    expect(result.down).toEqual(["storefront", "admin"]);
    expect(result.exitCode).toBe(8);
  });
});
