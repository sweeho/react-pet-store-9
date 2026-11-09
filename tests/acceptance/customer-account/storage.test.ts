// @vitest-environment node
import { describe, expect, it } from "vitest";
import { form, uname, without } from "./helpers";

// Assumed persistence boundary (Drizzle over bun:sqlite, foreign keys enforced), all async:
// server/customer/repository.ts exports
//   saveSignOnUser({ userName, password }) -> void      rejects a missing password or an existing user name
//   getSignOnUser(userName) -> { userName } | undefined
//   createCustomer({ userName, profile? }) -> void      user name must be a stored sign-on user and not yet
//     used by another customer (rejects otherwise); creates an active account with empty contact/card and a
//     default profile
//   getCustomer(userName) -> { identifier, account: { status, contact: { id, address: { id } }, creditCard: { id } },
//     profile: { id, language, favoriteCategory, myList, banner } } | undefined
//   updateCustomer(userName, form) -> void   replaces contact, address, card and profile from a flat form
//     { lastName, firstName, address1, address2?, city, state, postalCode, country, phone, email?,
//       cardNumber, cardType, cardExpiry, language, favoriteCategory, myList, banner };
//     rejects with a message naming the missing mandatory field
//   removeCustomer(userName) -> void         cascades to account, profile, contact, address and card
//   saveProfile({ language, favoriteCategory?, myList, banner }) -> { id }   rejects a missing mandatory value
//   getProfile(id) -> profile | undefined
//   saveAddress({ address1, address2?, city, state, postalCode, country }) -> { id }   rejects a missing mandatory field
//   getAddress(id) / getContact(id) / getCreditCard(id) -> record | undefined
//   saveContact({ firstName, lastName, phone, email, address: {...} }) -> { id }
//   getContact(id) -> { id, address: { id } } | undefined
//   saveAccount({ userName, contact, creditCard }) -> { id }   rejects a contact without e-mail
const repo = () => import("../../../server/customer/repository");

async function seed(userName = uname("c")) {
  const r = await repo();
  await r.saveSignOnUser({ userName, password: "pw" });
  await r.createCustomer({ userName });
  return userName;
}

const profileIn = (over: Record<string, unknown> = {}) => ({
  language: "en_US",
  favoriteCategory: "FISH",
  myList: true,
  banner: true,
  ...over,
});

describe("customer storage", () => {
  // case: SWHR8-C-0028@v1
  it('[SWHR8-C-0028] a customer "shopper" loads with one account, one profile and identifier "shopper"', async () => {
    const r = await repo();
    const name = uname("shopper");
    await seed(name);
    const c = await r.getCustomer(name);
    expect(c?.identifier).toBe(name);
    expect(c?.account).toBeDefined();
    expect(c?.profile).toBeDefined();
    expect(Array.isArray(c?.account)).toBe(false);
    expect(Array.isArray(c?.profile)).toBe(false);
  });

  // case: SWHR8-C-0029@v1
  it("[SWHR8-C-0029] a profile without favorite category is accepted; omitting language or a preference is rejected", async () => {
    const r = await repo();
    await expect(r.saveProfile(without(profileIn(), "favoriteCategory"))).resolves.toBeDefined();
    for (const key of ["language", "myList", "banner"]) {
      await expect(r.saveProfile(without(profileIn(), key))).rejects.toBeDefined();
    }
  });

  // case: SWHR8-C-0030@v1
  it("[SWHR8-C-0030] a new customer has an active account and a default profile", async () => {
    const r = await repo();
    const name = await seed();
    const c = await r.getCustomer(name);
    expect(c?.account.status).toBe("active");
    expect(c?.profile).toMatchObject({ language: "en_US", myList: true, banner: true });
  });

  // case: SWHR8-C-0035@v1
  it("[SWHR8-C-0035] a profile without a banner flag is rejected", async () => {
    const r = await repo();
    await expect(r.saveProfile(without(profileIn(), "banner"))).rejects.toBeDefined();
  });

  // case: SWHR8-C-0039@v1
  it("[SWHR8-C-0039] an address without a postal code is rejected", async () => {
    const r = await repo();
    await expect(
      r.saveAddress({ address1: "1 Main St", city: "Springfield", state: "CA", country: "USA" }),
    ).rejects.toBeDefined();
  });

  // case: SWHR8-C-0040@v1
  it("[SWHR8-C-0040] removing a customer removes account, profile, contact, address and card", async () => {
    const r = await repo();
    const name = await seed();
    await r.updateCustomer(name, form());
    const c = await r.getCustomer(name);
    const ids = {
      profile: c!.profile.id,
      contact: c!.account.contact.id,
      address: c!.account.contact.address.id,
      card: c!.account.creditCard.id,
    };
    await r.removeCustomer(name);
    expect(await r.getCustomer(name)).toBeUndefined();
    expect(await r.getProfile(ids.profile)).toBeUndefined();
    expect(await r.getContact(ids.contact)).toBeUndefined();
    expect(await r.getAddress(ids.address)).toBeUndefined();
    expect(await r.getCreditCard(ids.card)).toBeUndefined();
  });

  // case: SWHR8-C-0050@v1
  it('[SWHR8-C-0050] a customer with user id "shopper" owns one account and one profile', async () => {
    const r = await repo();
    const name = await seed(uname("shopper"));
    const c = await r.getCustomer(name);
    expect(c?.identifier).toBe(name);
    expect(c?.account).toBeTruthy();
    expect(c?.profile).toBeTruthy();
  });

  // case: SWHR8-C-0053@v1
  it("[SWHR8-C-0053] a customer update replaces contact, card and preference fields", async () => {
    const r = await repo();
    const name = await seed();
    await r.updateCustomer(name, form());
    const next = form({
      lastName: "Roe",
      firstName: "Rick",
      address1: "9 Elm St",
      city: "Portland",
      state: "OR",
      postalCode: "97000",
      phone: "555-0199",
      email: "rick@example.com",
      cardNumber: "5500-0000",
      cardType: "MasterCard",
      cardExpiry: "01/2032",
      language: "ja_JP",
      favoriteCategory: "BIRDS",
      myList: false,
      banner: false,
    });
    await r.updateCustomer(name, next);
    const c = await r.getCustomer(name);
    expect(c?.account.contact).toMatchObject({
      lastName: "Roe",
      firstName: "Rick",
      phone: "555-0199",
      email: "rick@example.com",
    });
    expect(c?.account.contact.address).toMatchObject({
      address1: "9 Elm St",
      city: "Portland",
      state: "OR",
      postalCode: "97000",
    });
    expect(c?.account.creditCard).toMatchObject({
      cardNumber: "5500-0000",
      cardType: "MasterCard",
      cardExpiry: "01/2032",
    });
    expect(c?.profile).toMatchObject({
      language: "ja_JP",
      favoriteCategory: "BIRDS",
      myList: false,
      banner: false,
    });
  });

  // case: SWHR8-C-0055@v1
  it("[SWHR8-C-0055] a customer form without a city is rejected naming the city field", async () => {
    const r = await repo();
    const name = await seed();
    await expect(r.updateCustomer(name, without(form(), "city"))).rejects.toThrow(/city/i);
  });

  // case: SWHR8-C-0059@v1
  it("[SWHR8-C-0059] an account whose contact has no e-mail is rejected", async () => {
    const r = await repo();
    const name = uname("a");
    await r.saveSignOnUser({ userName: name, password: "pw" });
    await expect(
      r.saveAccount({
        userName: name,
        contact: {
          firstName: "A",
          lastName: "B",
          phone: "555-0100",
          address: {
            address1: "1 Main St",
            city: "X",
            state: "CA",
            postalCode: "94000",
            country: "USA",
          },
        },
        creditCard: { cardNumber: "1", cardType: "Visa", cardExpiry: "12/2030" },
      }),
    ).rejects.toBeDefined();
  });

  // case: SWHR8-C-0060@v1
  it("[SWHR8-C-0060] a second customer on the same sign-on user is rejected", async () => {
    const r = await repo();
    const name = await seed();
    await expect(r.createCustomer({ userName: name })).rejects.toBeDefined();
  });

  // case: SWHR8-C-0062@v1
  it('[SWHR8-C-0062] storing a second user "j2ee" is rejected as a duplicate', async () => {
    const r = await repo();
    const name = uname("j2ee");
    await r.saveSignOnUser({ userName: name, password: "pw" });
    await expect(r.saveSignOnUser({ userName: name, password: "other" })).rejects.toBeDefined();
  });

  // case: SWHR8-C-0063@v1
  it("[SWHR8-C-0063] a sign-on record without a password is rejected", async () => {
    const r = await repo();
    await expect(r.saveSignOnUser({ userName: uname("np") })).rejects.toBeDefined();
  });

  // case: SWHR8-C-0064@v1
  it("[SWHR8-C-0064] a stored contact is linked to exactly one address", async () => {
    const r = await repo();
    const { id } = await r.saveContact({
      firstName: "A",
      lastName: "B",
      phone: "555-0100",
      email: "a@example.com",
      address: {
        address1: "1 Main St",
        city: "X",
        state: "CA",
        postalCode: "94000",
        country: "USA",
      },
    });
    const contact = await r.getContact(id);
    expect(contact?.address).toBeDefined();
    expect(Array.isArray(contact?.address)).toBe(false);
    expect(await r.getAddress(contact!.address.id)).toBeDefined();
  });
});
