// @vitest-environment node
import { describe, expect, it } from "vitest";

import * as r from "../../../server/customer/repository";

let seq = 0;
const uname = (p = "r") => `${p}${Date.now().toString(36)}${++seq}`.slice(0, 25);
const address = {
  address1: "1 Main St",
  city: "X",
  state: "CA",
  postalCode: "94000",
  country: "USA",
};
const contact = { firstName: "A", lastName: "B", phone: "555", email: "a@x.com", address };
const form = (over: Record<string, unknown> = {}) => ({
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  country: "USA",
  phone: "555-0100",
  email: "j@x.com",
  cardNumber: "4111",
  cardType: "Visa",
  cardExpiry: "12/2030",
  language: "en_US",
  favoriteCategory: "FISH",
  myList: true,
  banner: true,
  ...over,
});
const profile = (over: Record<string, unknown> = {}) => ({
  language: "en_US",
  favoriteCategory: "FISH",
  myList: true,
  banner: true,
  ...over,
});
const omit = (o: Record<string, unknown>, k: string) =>
  Object.fromEntries(Object.entries(o).filter(([key]) => key !== k));
async function seed(name = uname()) {
  await r.saveSignOnUser({ userName: name, password: "pw" });
  await r.createCustomer({ userName: name });
  return name;
}

describe("customer repository", () => {
  it("[SWHR8-C-0028] a customer loads with one account, one profile and its identifier", async () => {
    const name = await seed();
    const c = await r.getCustomer(name);
    expect(c.identifier).toBe(name);
    expect(Array.isArray(c.account)).toBe(false);
    expect(Array.isArray(c.profile)).toBe(false);
  });
  it("[SWHR8-C-0050] a customer owns one account and one profile", async () => {
    const c = await r.getCustomer(await seed());
    expect(c.account.status).toBe("active");
    expect(c.profile.id).toBeTypeOf("number");
  });
  it("[SWHR8-C-0029] a profile without favorite category is accepted; missing values rejected", async () => {
    await expect(r.saveProfile(omit(profile(), "favoriteCategory"))).resolves.toHaveProperty("id");
    for (const k of ["language", "myList", "banner"]) {
      await expect(r.saveProfile(omit(profile(), k))).rejects.toBeDefined();
    }
  });
  it("[SWHR8-C-0035] a profile without a banner flag is rejected", async () => {
    await expect(r.saveProfile(omit(profile(), "banner"))).rejects.toBeDefined();
  });
  it("[SWHR8-C-0030] a new customer has an active account and a default profile", async () => {
    const c = await r.getCustomer(await seed());
    expect(c.account.status).toBe("active");
    expect(c.profile).toMatchObject({ language: "en_US", myList: true, banner: true });
  });
  it("[SWHR8-C-0039] an address without a postal code is rejected", async () => {
    await expect(r.saveAddress(omit(address, "postalCode"))).rejects.toBeDefined();
  });
  it("[SWHR8-C-0064] a stored contact is linked to exactly one address", async () => {
    const { id } = await r.saveContact(contact);
    const c = await r.getContact(id);
    expect(Array.isArray(c.address)).toBe(false);
    expect(await r.getAddress(c.address.id)).toBeDefined();
  });
  it("[SWHR8-C-0059] an account whose contact has no e-mail is rejected", async () => {
    const name = uname();
    await r.saveSignOnUser({ userName: name, password: "pw" });
    await expect(
      r.saveAccount({
        userName: name,
        contact: omit(contact, "email"),
        creditCard: { cardNumber: "1", cardType: "Visa", cardExpiry: "12/2030" },
      }),
    ).rejects.toBeDefined();
  });
  it("[SWHR8-C-0060] a second customer on the same sign-on user is rejected", async () => {
    const name = await seed();
    await expect(r.createCustomer({ userName: name })).rejects.toBeDefined();
  });
  it("[SWHR8-C-0062] a duplicate user name is rejected", async () => {
    const name = uname();
    await r.saveSignOnUser({ userName: name, password: "pw" });
    await expect(r.saveSignOnUser({ userName: name, password: "x" })).rejects.toBeDefined();
  });
  it("[SWHR8-C-0063] a sign-on record without a password is rejected", async () => {
    await expect(r.saveSignOnUser({ userName: uname() })).rejects.toBeDefined();
  });
  it("[SWHR8-C-0055] a customer form without a city is rejected naming the city field", async () => {
    await expect(r.updateCustomer(await seed(), omit(form(), "city"))).rejects.toThrow(/city/i);
  });
  it("[SWHR8-C-0053] a customer update replaces contact, card and preferences", async () => {
    const name = await seed();
    await r.updateCustomer(name, form());
    await r.updateCustomer(
      name,
      form({
        lastName: "Roe",
        city: "Portland",
        cardType: "MasterCard",
        language: "ja_JP",
        favoriteCategory: "BIRDS",
        myList: false,
        banner: false,
      }),
    );
    const c = await r.getCustomer(name);
    expect(c.account.contact).toMatchObject({ lastName: "Roe" });
    expect(c.account.contact.address).toMatchObject({ city: "Portland" });
    expect(c.account.creditCard).toMatchObject({ cardType: "MasterCard" });
    expect(c.profile).toMatchObject({
      language: "ja_JP",
      favoriteCategory: "BIRDS",
      myList: false,
      banner: false,
    });
  });
  it("[SWHR8-C-0040] removing a customer removes account, profile, contact, address and card", async () => {
    const name = await seed();
    await r.updateCustomer(name, form());
    const c = await r.getCustomer(name);
    await r.removeCustomer(name);
    expect(await r.getCustomer(name)).toBeUndefined();
    expect(await r.getProfile(c.profile.id)).toBeUndefined();
    expect(await r.getContact(c.account.contact.id)).toBeUndefined();
    expect(await r.getAddress(c.account.contact.address.id)).toBeUndefined();
    expect(await r.getCreditCard(c.account.creditCard.id)).toBeUndefined();
  });
});
