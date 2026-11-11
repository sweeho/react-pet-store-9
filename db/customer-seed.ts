import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";

import * as schema from "./schema";
import { account, address, contact, creditCard, customer, profile, signonUser } from "./schema";

/** Adds j2ee/j2ee and shopper/shopper (with a full customer record) when no sign-on user exists. */
export function seedCustomers(db: BunSQLiteDatabase<typeof schema>): void {
  if (db.select().from(signonUser).all().length > 0) return;
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
