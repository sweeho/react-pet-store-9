export interface AdminSession {
  userName: string;
  isAdministrator: boolean;
}

export interface InventoryItem {
  itemId: string;
  description: string;
  productId: string;
  productName: string;
  quantity: number;
}

export const INVENTORY_PATH = "/admin/inventory";

export const loginPath = (next: string): string => `/admin/login?next=${encodeURIComponent(next)}`;

/** The administration sign-on of this session (`null` when signed out). */
export async function fetchAdminSession(): Promise<AdminSession | null> {
  const res = await fetch("/api/session");
  if (!res.ok) throw new Error("Session unavailable");
  return ((await res.json()) as { admin?: AdminSession | null }).admin ?? null;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch("/api/admin/inventory");
  if (!res.ok) throw new Error("Inventory unavailable");
  return ((await res.json()) as { items: InventoryItem[] }).items;
}

export const signOffAdmin = (): Promise<Response> =>
  fetch("/api/admin/signoff", { method: "POST" });

/** What the entry in a "New quantity" box means. */
export type Entry = { kind: "blank" } | { kind: "ignored" } | { kind: "change"; quantity: number };

export function readEntry(text: string): Entry {
  const v = text.trim();
  if (v === "") return { kind: "blank" };
  return /^\d+$/.test(v) && Number.isSafeInteger(Number(v))
    ? { kind: "change", quantity: Number(v) }
    : { kind: "ignored" };
}
