import { HTTPError, type H3Event } from "nitro/h3";

import { localeConfigFromEnv, parseLocaleCode } from "../localization/locale";
import { sharedSessions } from "../localization/sessions";
import { clockFor } from "./auth";
import { validateCustomerForm } from "./model";
import { createCustomer, getCustomer, updateCustomer } from "./repository";

export const now = (event: H3Event): Date => clockFor(event.context.sessionId as string);

/** The signed-on user name, or a 401 (protected resources, design A5). */
export function requireSignedOn(event: H3Event): string {
  const userName = event.context.userName as string | undefined;
  if (!userName) throw new HTTPError({ status: 401, message: "Sign on required" });
  return userName;
}

const FORM_TEXT = [
  "lastName",
  "firstName",
  "address1",
  "address2",
  "city",
  "state",
  "postalCode",
  "country",
  "phone",
  "email",
  "cardNumber",
  "cardType",
  "cardExpiry",
  "language",
  "favoriteCategory",
] as const;

/** An unchecked HTML checkbox sends nothing, so an absent or false flag is off (R-0043). */
const checked = (v: unknown): boolean => v === true || v === "on" || v === "true";

/** The flat customer form from a request body; text fields are trimmed, flags follow checkbox semantics. */
export function formFromBody(body: unknown): Record<string, unknown> {
  const src = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const form: Record<string, unknown> = {};
  for (const key of FORM_TEXT) {
    if (typeof src[key] === "string") form[key] = (src[key] as string).trim();
  }
  form.myList = checked(src.myList);
  form.banner = checked(src.banner);
  return form;
}

/** The flat customer form of a stored customer, as the profile screen edits it. */
export function formFromCustomer(c: NonNullable<Awaited<ReturnType<typeof getCustomer>>>) {
  const { contact, creditCard } = c.account;
  const { address } = contact;
  return {
    userName: c.identifier,
    status: c.account.status,
    lastName: contact.lastName,
    firstName: contact.firstName,
    phone: contact.phone,
    email: contact.email,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    cardNumber: creditCard.cardNumber,
    cardType: creditCard.cardType,
    cardExpiry: creditCard.cardExpiry,
    language: c.profile.language,
    favoriteCategory: c.profile.favoriteCategory,
    myList: c.profile.myList,
    banner: c.profile.banner,
  };
}

/** Creates the customer record if the user has none, stores the form, and applies its language to the session. */
export async function saveCustomerForm(event: H3Event, userName: string, body: unknown) {
  const form = formFromBody(body);
  try {
    validateCustomerForm(form);
    if (parseLocaleCode(form.language as string, localeConfigFromEnv()) === null) {
      throw new Error("language is not supported");
    }
    if (!(await getCustomer(userName))) await createCustomer({ userName });
    await updateCustomer(userName, form);
  } catch (e) {
    throw new HTTPError({ status: 400, message: (e as Error).message });
  }
  const sessionId = event.context.sessionId as string;
  const applied = await sharedSessions()
    .changeLocale(sessionId, form.language as string, now(event))
    .catch(() => ({ locale: event.context.locale as string }));
  return { saved: true, locale: applied.locale };
}
