// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/jobs/health-check.ts exports
//   runHealthCheck({ modules, fetch }): Promise<{ exitCode: number; down: string[]; log: string[] }>
// modules maps a module name to its URL; fetch is the HTTP client (same signature as global fetch).
const loadHealth = () => import("../../../server/jobs/health-check");

describe("availability check", () => {
  // case: SWHR8-C-0146@v1
  it("[SWHR8-C-0146] logs the admin module as down and exits 8 when it answers HTTP 503", async () => {
    const { runHealthCheck } = await loadHealth();
    const fetchStub = async (url: string | URL | Request) =>
      String(url).includes("admin")
        ? new Response("unavailable", { status: 503 })
        : new Response("ok", { status: 200 });

    const result = await runHealthCheck({
      modules: {
        storefront: "http://localhost/petstore/",
        admin: "http://localhost/admin/",
      },
      fetch: fetchStub,
    });

    expect(result.down).toEqual(["admin"]);
    expect(result.log.some((line) => /admin/i.test(line) && /down/i.test(line))).toBe(true);
    expect(result.exitCode).toBe(8);
  });
});
