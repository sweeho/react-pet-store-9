import type { Category, Item, Page, Product } from "../../../server/catalog/catalog";

export type { Category, Item, Page, Product };
export type ItemWithProduct = Item & { productName: string; categoryId?: string };

/** GETs JSON. A 404 is `undefined` (not found); any other failure throws so the page shows its error frame. */
export async function getJson<T>(url: string): Promise<T | undefined> {
  const response = await fetch(url);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`);
  return (await response.json()) as T;
}

/** `?start=` of the current URL; anything unparseable pages to nothing, like the server. */
export function startOf(params: URLSearchParams): number {
  const raw = params.get("start");
  if (raw === null) return 0;
  const start = Number(raw);
  return Number.isInteger(start) ? start : -1;
}
