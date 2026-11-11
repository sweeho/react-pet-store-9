// The only code that touches the customer tables (change swhr8-i-0005, design A1, A2).
import { eq } from "drizzle-orm";

import { db } from "../../db/client";
import {
  account,
  address,
  contact,
  creditCard,
  customer,
  profile,
  signonUser,
} from "../../db/schema";
import {
  createProfile,
  requireFields,
  validateAddress,
  validateContact,
  validateCustomerForm,
  validateNewUser,
  validateProfile,
} from "./model";

type Row = Record<string, unknown>;
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface AddressRecord {
  id: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const text = (v: unknown): string => (v === undefined || v === null ? "" : String(v));
const orNull = (v: unknown): string | null =>
  v === undefined || v === null || v === "" ? null : String(v);

function addressOut(row: typeof address.$inferSelect): AddressRecord {
  return {
    id: row.id,
    address1: text(row.address1),
    address2: text(row.address2),
    city: text(row.city),
    state: text(row.state),
    postalCode: text(row.postalCode),
    country: text(row.country),
  };
}

const addressValues = (a: Row) => ({
  address1: orNull(a.address1),
  address2: orNull(a.address2),
  city: orNull(a.city),
  state: orNull(a.state),
  postalCode: orNull(a.postalCode),
  country: orNull(a.country),
});

const contactValues = (c: Row) => ({
  firstName: orNull(c.firstName),
  lastName: orNull(c.lastName),
  phone: orNull(c.phone),
  email: text(c.email),
});

const cardValues = (c: Row) => ({
  cardNumber: orNull(c.cardNumber),
  cardType: orNull(c.cardType),
  cardExpiry: orNull(c.cardExpiry),
});

export async function saveSignOnUser(user: Row): Promise<void> {
  validateNewUser(user as { userName?: string; password?: string });
  db.insert(signonUser)
    .values({ userName: user.userName as string, password: user.password as string })
    .run();
}

export async function getSignOnUser(userName: string): Promise<{ userName: string } | undefined> {
  const row = db.select().from(signonUser).where(eq(signonUser.userName, userName)).get();
  return row ? { userName: row.userName } : undefined;
}

export async function checkPassword(userName: string, password: string): Promise<boolean> {
  const row = db.select().from(signonUser).where(eq(signonUser.userName, userName)).get();
  return row !== undefined && row.password === password;
}

function insertProfile(tx: Tx, input: Row, userName?: string): number {
  const p = createProfile(input as never);
  validateProfile(p as unknown as Row);
  return tx
    .insert(profile)
    .values({ userName, ...p, favoriteCategory: orNull(p.favoriteCategory) })
    .returning({ id: profile.id })
    .get().id;
}

function insertEmptyParts(tx: Tx) {
  const addressId = tx.insert(address).values({}).returning({ id: address.id }).get().id;
  const contactId = tx
    .insert(contact)
    .values({ addressId, email: "" })
    .returning({ id: contact.id })
    .get().id;
  const cardId = tx.insert(creditCard).values({}).returning({ id: creditCard.id }).get().id;
  return { contactId, cardId };
}

export async function createCustomer(input: { userName: string; profile?: Row }): Promise<void> {
  if (!(await getSignOnUser(input.userName))) throw new Error("Unknown sign-on user");
  db.transaction((tx) => {
    tx.insert(customer).values({ userName: input.userName }).run();
    const { contactId, cardId } = insertEmptyParts(tx);
    tx.insert(account)
      .values({ userName: input.userName, status: "active", contactId, creditCardId: cardId })
      .run();
    insertProfile(tx, input.profile ?? {}, input.userName);
  });
}

export async function getContact(id: number) {
  const row = db.select().from(contact).where(eq(contact.id, id)).get();
  const addr = row && db.select().from(address).where(eq(address.id, row.addressId)).get();
  if (!row || !addr) return undefined;
  return {
    id: row.id,
    firstName: text(row.firstName),
    lastName: text(row.lastName),
    phone: text(row.phone),
    email: text(row.email),
    address: addressOut(addr),
  };
}

export async function getAddress(id: number): Promise<AddressRecord | undefined> {
  const row = db.select().from(address).where(eq(address.id, id)).get();
  return row ? addressOut(row) : undefined;
}

export async function getCreditCard(id: number) {
  const row = db.select().from(creditCard).where(eq(creditCard.id, id)).get();
  return row
    ? {
        id: row.id,
        cardNumber: text(row.cardNumber),
        cardType: text(row.cardType),
        cardExpiry: text(row.cardExpiry),
      }
    : undefined;
}

export async function getProfile(id: number) {
  const row = db.select().from(profile).where(eq(profile.id, id)).get();
  return row
    ? {
        id: row.id,
        language: row.language,
        favoriteCategory: text(row.favoriteCategory),
        myList: row.myList,
        banner: row.banner,
      }
    : undefined;
}

export async function getCustomer(userName: string) {
  const c = db.select().from(customer).where(eq(customer.userName, userName)).get();
  const acc = c && db.select().from(account).where(eq(account.userName, userName)).get();
  const prof = c && db.select().from(profile).where(eq(profile.userName, userName)).get();
  if (!c || !acc || !prof) return undefined;
  const contactRecord = await getContact(acc.contactId);
  const card = await getCreditCard(acc.creditCardId);
  if (!contactRecord || !card) return undefined;
  return {
    identifier: c.userName,
    account: { id: acc.id, status: acc.status, contact: contactRecord, creditCard: card },
    profile: (await getProfile(prof.id))!,
  };
}

export async function updateCustomer(userName: string, form: Row): Promise<void> {
  validateCustomerForm(form);
  const current = await getCustomer(userName);
  if (!current) throw new Error("Unknown customer");
  const { contact: ct, creditCard: card } = current.account;
  db.transaction((tx) => {
    tx.update(address).set(addressValues(form)).where(eq(address.id, ct.address.id)).run();
    tx.update(contact).set(contactValues(form)).where(eq(contact.id, ct.id)).run();
    tx.update(creditCard).set(cardValues(form)).where(eq(creditCard.id, card.id)).run();
    tx.update(profile)
      .set({
        language: form.language as string,
        favoriteCategory: orNull(form.favoriteCategory),
        myList: form.myList as boolean,
        banner: form.banner as boolean,
      })
      .where(eq(profile.id, current.profile.id))
      .run();
  });
}

export async function removeCustomer(userName: string): Promise<void> {
  const current = await getCustomer(userName);
  if (!current) return;
  db.transaction((tx) => {
    tx.delete(account).where(eq(account.userName, userName)).run();
    tx.delete(profile).where(eq(profile.userName, userName)).run();
    tx.delete(customer).where(eq(customer.userName, userName)).run();
    tx.delete(contact).where(eq(contact.id, current.account.contact.id)).run();
    tx.delete(address).where(eq(address.id, current.account.contact.address.id)).run();
    tx.delete(creditCard).where(eq(creditCard.id, current.account.creditCard.id)).run();
  });
}

export async function saveProfile(input: Row): Promise<{ id: number }> {
  validateProfile({ ...input, favoriteCategory: input.favoriteCategory });
  return db.transaction((tx) => ({ id: insertProfile(tx, input) }));
}

export async function saveAddress(input: Row): Promise<{ id: number }> {
  validateAddress(input);
  return db.insert(address).values(addressValues(input)).returning({ id: address.id }).get();
}

export async function saveContact(input: Row): Promise<{ id: number }> {
  validateContact(input);
  return db.transaction((tx) => {
    const addressId = tx
      .insert(address)
      .values(addressValues(input.address as Row))
      .returning({ id: address.id })
      .get().id;
    return tx
      .insert(contact)
      .values({ ...contactValues(input), addressId })
      .returning({ id: contact.id })
      .get();
  });
}

export async function saveAccount(input: {
  userName: string;
  contact: Row;
  creditCard: Row;
}): Promise<{ id: number }> {
  validateContact(input.contact);
  requireFields(input.creditCard, ["cardNumber", "cardType", "cardExpiry"]);
  return db.transaction((tx) => {
    const addressId = tx
      .insert(address)
      .values(addressValues(input.contact.address as Row))
      .returning({ id: address.id })
      .get().id;
    const contactId = tx
      .insert(contact)
      .values({ ...contactValues(input.contact), addressId })
      .returning({ id: contact.id })
      .get().id;
    const cardId = tx
      .insert(creditCard)
      .values(cardValues(input.creditCard))
      .returning({ id: creditCard.id })
      .get().id;
    return tx
      .insert(account)
      .values({ userName: input.userName, contactId, creditCardId: cardId })
      .returning({ id: account.id })
      .get();
  });
}
