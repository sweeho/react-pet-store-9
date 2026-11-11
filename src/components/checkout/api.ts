import { postJson } from "@/components/account/api";

export const FIELDS = [
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "state",
  "postalCode",
  "phone",
  "email",
] as const;

export type Field = (typeof FIELDS)[number];
export type Party = Record<Field, string>;

export const emptyParty = (): Party =>
  Object.fromEntries(FIELDS.map((f) => [f, ""])) as unknown as Party;

/** The saved contact of the signed-on customer; empty when signed out or on any failure. */
export async function fetchProfile(): Promise<Party> {
  try {
    const res = await fetch("/api/account/profile");
    if (!res.ok) return emptyParty();
    const body = (await res.json()) as Partial<Record<Field, string | null>>;
    return Object.fromEntries(FIELDS.map((f) => [f, body[f] ?? ""])) as unknown as Party;
  } catch {
    return emptyParty();
  }
}

export type CheckoutResult =
  | { kind: "placed"; orderNumber: number; email: string }
  | { kind: "empty" }
  | { kind: "missing"; missing: string[] }
  | { kind: "failed" };

export async function submitOrder(billing: Party, shipping: Party): Promise<CheckoutResult> {
  try {
    const res = await postJson("/api/checkout", { billing, shipping });
    if (res.status === 409) return { kind: "empty" };
    const body = (await res.json().catch(() => ({}))) as {
      orderNumber?: number;
      email?: string;
      missing?: string[];
    };
    if (res.status === 400 && Array.isArray(body.missing)) {
      return { kind: "missing", missing: body.missing };
    }
    if (res.ok && body.orderNumber !== undefined) {
      return { kind: "placed", orderNumber: body.orderNumber, email: body.email ?? "" };
    }
  } catch {
    // falls through to "failed"
  }
  return { kind: "failed" };
}

export const fieldId = (party: string, field: Field): string => `${party}-${field}`;
