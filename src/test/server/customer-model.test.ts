// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  createAccount,
  createProfile,
  setAccountStatus,
  validateNewUser,
} from "../../../server/customer/model";

const empty = (o: object) =>
  Object.values(o).filter((v) => v !== undefined && v !== null && v !== "");

describe("customer model", () => {
  it("[SWHR8-C-0036] a 26-character or asterisk or percent user name is rejected", () => {
    expect(() => validateNewUser({ userName: "a".repeat(26), password: "pw" })).toThrow();
    expect(() => validateNewUser({ userName: "bad*name", password: "pw" })).toThrow();
    expect(() => validateNewUser({ userName: "bad%name", password: "pw" })).toThrow();
    expect(() => validateNewUser({ userName: "a".repeat(25), password: "pw" })).not.toThrow();
    expect(() => validateNewUser({ userName: "ok", password: "" })).toThrow();
  });

  it("[SWHR8-C-0041] a new account is active with empty contact and credit-card records", () => {
    const account = createAccount();
    expect(account.status).toBe("active");
    expect(empty(account.contact)).toEqual([]);
    expect(empty(account.creditCard)).toEqual([]);
  });

  it("[SWHR8-C-0042] a profile created without input uses the defaults", () => {
    expect(createProfile()).toEqual({
      language: "en_US",
      favoriteCategory: "",
      myList: true,
      banner: true,
    });
  });

  it("[SWHR8-C-0043] a profile exposes language, favorite category, my-list and banner", () => {
    const input = { language: "ja_JP", favoriteCategory: "CATS", myList: false, banner: false };
    expect(createProfile(input)).toEqual(input);
  });

  it("[SWHR8-C-0044] only active or disabled statuses are accepted", () => {
    const account = createAccount();
    expect(setAccountStatus(account, "disabled").status).toBe("disabled");
    expect(setAccountStatus(account, "active").status).toBe("active");
    expect(() => setAccountStatus(account, "suspended")).toThrow();
  });
});
