import { eq, inArray } from "drizzle-orm";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";

import * as schema from "./schema";
import {
  account,
  address,
  contact,
  creditCard,
  customer,
  profile,
  signonUser,
  userRole,
} from "./schema";

/** Adds the administrator jps_admin and the role-less customer account (design F7, SD5) when missing. */
function seedAdministration(db: BunSQLiteDatabase<typeof schema>): void {
  db.insert(signonUser)
    .values([
      { userName: "jps_admin", password: "admin" },
      { userName: "customer", password: "customer-password" },
    ])
    .onConflictDoNothing()
    .run();
  db.insert(userRole)
    .values({ userName: "jps_admin", role: "administrator" })
    .onConflictDoNothing()
    .run();
}

/** Inserts j2ee/j2ee and shopper/shopper with a full customer record; the rows must not exist. */
export function insertSampleCustomers(db: BunSQLiteDatabase<typeof schema>): void {
  db.transaction((tx) => {
    tx.insert(signonUser)
      .values([
        { userName: "j2ee", password: "j2ee" },
        { userName: "shopper", password: "shopper" },
      ])
      .run();
    tx.insert(customer).values({ userName: "shopper" }).run();
    const addressId = tx
      .insert(address)
      .values({
        address1: "1200 Harbor Blvd",
        address2: "Apt 4B",
        city: "Palo Alto",
        state: "CA",
        postalCode: "94303",
        country: "USA",
      })
      .returning({ id: address.id })
      .get().id;
    const contactId = tx
      .insert(contact)
      .values({
        firstName: "Sophie",
        lastName: "Tanaka",
        phone: "555-555-5555",
        email: "sophie.tanaka@example.com",
        addressId,
      })
      .returning({ id: contact.id })
      .get().id;
    const cardId = tx
      .insert(creditCard)
      .values({ cardNumber: "4111 1111 1111 1111", cardType: "Visa", cardExpiry: "12/2028" })
      .returning({ id: creditCard.id })
      .get().id;
    tx.insert(account)
      .values({ userName: "shopper", status: "active", contactId, creditCardId: cardId })
      .run();
    tx.insert(profile)
      .values({
        userName: "shopper",
        language: "en_US",
        favoriteCategory: "FISH",
        myList: true,
        banner: true,
      })
      .run();
  });
}

/** Adds j2ee/j2ee and shopper/shopper (with a full customer record) when no sign-on user exists. */
export function seedCustomers(db: BunSQLiteDatabase<typeof schema>): void {
  if (db.select().from(signonUser).all().length === 0) insertSampleCustomers(db);
  seedAdministration(db);
}

/** Removes the sample sign-on users and their dependents, then inserts them again with sample values. */
export function resetSampleCustomers(db: BunSQLiteDatabase<typeof schema>): void {
  const names = ["j2ee", "shopper", "jps_admin", "customer"];
  db.transaction((tx) => {
    const old = tx.select().from(account).where(inArray(account.userName, names)).all();
    tx.delete(signonUser).where(inArray(signonUser.userName, names)).run();
    for (const a of old) {
      const c = tx.select().from(contact).where(eq(contact.id, a.contactId)).get();
      tx.delete(contact).where(eq(contact.id, a.contactId)).run();
      if (c) tx.delete(address).where(eq(address.id, c.addressId)).run();
      tx.delete(creditCard).where(eq(creditCard.id, a.creditCardId)).run();
    }
    insertSampleCustomers(tx as unknown as BunSQLiteDatabase<typeof schema>);
    seedAdministration(tx as unknown as BunSQLiteDatabase<typeof schema>);
  });
}
