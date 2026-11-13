// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  adminSession,
  adminSignOff,
  adminSignOn,
  requireAdministrator,
} from "../../../../server/admin/auth";

const event = (sessionId: string) => ({ context: { sessionId } }) as never;

describe("administrator access", () => {
  it("is refused with 401 when signed out", () => {
    expect(() => requireAdministrator(event("s-out"))).toThrow(
      expect.objectContaining({ status: 401 }),
    );
  });

  it("[SWHR8-C-0229] is refused with 403 for a signed-in user without the administrator role", async () => {
    expect(await adminSignOn("s-cust", "customer", "customer-password")).toEqual({
      userName: "customer",
      isAdministrator: false,
    });
    expect(() => requireAdministrator(event("s-cust"))).toThrow(
      expect.objectContaining({ status: 403 }),
    );
  });

  it("admits jps_admin and forgets the sign-on on sign-off; wrong passwords sign nobody on", async () => {
    expect(await adminSignOn("s-bad", "jps_admin", "nope")).toBeNull();
    expect(adminSession("s-bad")).toBeNull();
    await adminSignOn("s-adm", "jps_admin", "admin");
    expect(requireAdministrator(event("s-adm")).userName).toBe("jps_admin");
    adminSignOff("s-adm");
    expect(adminSession("s-adm")).toBeNull();
  });
});
