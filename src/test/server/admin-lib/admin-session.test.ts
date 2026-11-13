// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createAdminSession, isAdminSessionExpired } from "../../../../server/lib/admin-session";

describe("admin session idle expiry", () => {
  // case: SWHR8-C-0262@v1
  it("[SWHR8-C-0262] a session idle for 54 minutes is expired; 53 minutes is not", () => {
    const t0 = new Date("2026-03-10T09:00:00Z");
    const s = createAdminSession(t0);
    expect(isAdminSessionExpired(s, new Date("2026-03-10T09:53:00Z"))).toBe(false);
    expect(isAdminSessionExpired(s, new Date("2026-03-10T09:54:00Z"))).toBe(true);
  });
});
