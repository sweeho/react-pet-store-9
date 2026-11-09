// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary (pure, no database): server/customer/model.ts exports
//   validateNewUser({ userName, password }) -> void   throws when the user name is over 25 characters or
//     contains '%' or '*', or the password is over the maximum length
//   createAccount() -> { status: "active", contact: {}, creditCard: {} }
//   setAccountStatus(account, status) -> account      throws unless status is "active" or "disabled"
//   createProfile(input?) -> { language, favoriteCategory, myList, banner }
//     defaults: "en_US", empty favoriteCategory (undefined/null/""), true, true
const mod = () => import("../../../server/customer/model");

describe("customer model", () => {
  // case: SWHR8-C-0036@v1
  it("[SWHR8-C-0036] a 26-character or asterisk user name is rejected", async () => {
    const { validateNewUser } = await mod();
    expect(() => validateNewUser({ userName: "a".repeat(26), password: "secret" })).toThrow();
    expect(() => validateNewUser({ userName: "bad*name", password: "secret" })).toThrow();
  });

  // case: SWHR8-C-0041@v1
  it("[SWHR8-C-0041] a new account is active with empty contact and credit-card records", async () => {
    const { createAccount } = await mod();
    const account = createAccount();
    expect(account.status).toBe("active");
    expect(account.contact).toBeDefined();
    expect(account.creditCard).toBeDefined();
    expect(
      Object.values(account.contact).filter((v) => v !== undefined && v !== null && v !== ""),
    ).toEqual([]);
    expect(
      Object.values(account.creditCard).filter((v) => v !== undefined && v !== null && v !== ""),
    ).toEqual([]);
  });

  // case: SWHR8-C-0042@v1
  it("[SWHR8-C-0042] a profile created without input uses the defaults", async () => {
    const { createProfile } = await mod();
    const p = createProfile();
    expect(p.language).toBe("en_US");
    expect(p.favoriteCategory ?? "").toBe("");
    expect(p.myList).toBe(true);
    expect(p.banner).toBe(true);
  });

  // case: SWHR8-C-0043@v1
  it("[SWHR8-C-0043] a profile exposes language, favorite category, my-list and banner", async () => {
    const { createProfile } = await mod();
    const p = createProfile({
      language: "ja_JP",
      favoriteCategory: "CATS",
      myList: false,
      banner: false,
    });
    expect(p).toMatchObject({
      language: "ja_JP",
      favoriteCategory: "CATS",
      myList: false,
      banner: false,
    });
  });

  // case: SWHR8-C-0044@v1
  it("[SWHR8-C-0044] only active or disabled statuses are accepted", async () => {
    const { createAccount, setAccountStatus } = await mod();
    const account = createAccount();
    expect(setAccountStatus(account, "active").status).toBe("active");
    expect(setAccountStatus(account, "disabled").status).toBe("disabled");
    expect(() => setAccountStatus(account, "suspended")).toThrow();
  });
});
