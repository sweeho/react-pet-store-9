// Pure customer rules and defaults (change swhr8-i-0005, design A1, A3). No database here.

export const USER_NAME_MAX = 25;
export const PASSWORD_MAX = 25;
export const ACCOUNT_STATUSES = ["active", "disabled"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface Profile {
  language: string;
  favoriteCategory: string;
  myList: boolean;
  banner: boolean;
}

export interface ProfileInput {
  language?: string;
  favoriteCategory?: string | null;
  myList?: boolean;
  banner?: boolean;
}

export interface Account {
  status: AccountStatus;
  contact: Record<string, string | undefined>;
  creditCard: Record<string, string | undefined>;
}

export const DEFAULT_LANGUAGE = "en_US";

const present = (v: unknown): boolean => v !== undefined && v !== null && String(v).trim() !== "";

/** Throws naming the first field of `fields` that has no value. */
export function requireFields(record: Record<string, unknown>, fields: readonly string[]): void {
  for (const field of fields) {
    if (!present(record[field])) throw new Error(`${field} is required`);
  }
}

/** A new sign-on user: both values present, a user name of at most 25 characters without % or *. */
export function validateNewUser(user: { userName?: string; password?: string }): void {
  requireFields(user, ["userName", "password"]);
  const { userName = "", password = "" } = user;
  if (userName.length > USER_NAME_MAX) throw new Error("userName is too long");
  if (/[%*]/.test(userName)) throw new Error("userName must not contain % or *");
  if (password.length > PASSWORD_MAX) throw new Error("password is too long");
}

export const ADDRESS_REQUIRED = ["address1", "city", "state", "postalCode", "country"] as const;
export const CONTACT_REQUIRED = ["firstName", "lastName", "phone"] as const;
export const CARD_FIELDS = ["cardNumber", "cardType", "cardExpiry"] as const;

export function validateAddress(address: Record<string, unknown>): void {
  requireFields(address, ADDRESS_REQUIRED);
}

/** E-mail is mandatory on the stored contact but may be an empty string (design D5). */
export function validateContact(contact: Record<string, unknown>): void {
  requireFields(contact, CONTACT_REQUIRED);
  if (contact.email === undefined || contact.email === null) throw new Error("email is required");
  validateAddress((contact.address ?? {}) as Record<string, unknown>);
}

export function validateProfile(profile: Record<string, unknown>): void {
  requireFields(profile, ["language"]);
  for (const flag of ["myList", "banner"]) {
    if (typeof profile[flag] !== "boolean") throw new Error(`${flag} is required`);
  }
}

/** The customer form: contact, address and preferences are mandatory; the card is stored as entered. */
export function validateCustomerForm(form: Record<string, unknown>): void {
  requireFields(form, [
    "firstName",
    "lastName",
    "address1",
    "city",
    "state",
    "postalCode",
    "country",
    "phone",
    "language",
  ]);
  for (const flag of ["myList", "banner"]) {
    if (typeof form[flag] !== "boolean") throw new Error(`${flag} is required`);
  }
}

export function createAccount(): Account {
  return { status: "active", contact: {}, creditCard: {} };
}

export function setAccountStatus<T extends { status: string }>(account: T, status: string): T {
  if (!(ACCOUNT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`Unknown account status: ${status}`);
  }
  return { ...account, status };
}

export function createProfile(input: ProfileInput = {}): Profile {
  return {
    language: input.language || DEFAULT_LANGUAGE,
    favoriteCategory: input.favoriteCategory ?? "",
    myList: input.myList ?? true,
    banner: input.banner ?? true,
  };
}
