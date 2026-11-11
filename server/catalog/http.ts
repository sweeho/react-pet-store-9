import { createError, getQuery, type H3Event } from "nitro/h3";

import { CatalogError, CATALOG_PAGE_SIZE, type PageRequest } from "./catalog";

export const localeOf = (event: H3Event): string => String(event.context.locale ?? "en_US");

/** `?start=` and `?count=` as a page request; a bad `start` becomes -1, which pages to nothing. */
export function pageOf(event: H3Event): PageRequest {
  const query = getQuery(event);
  const start = query.start === undefined ? 0 : Number(query.start);
  const count = query.count === undefined ? CATALOG_PAGE_SIZE : Number(query.count);
  return {
    start: Number.isInteger(start) ? start : -1,
    count: Number.isInteger(count) && count >= 1 ? Math.min(count, 50) : CATALOG_PAGE_SIZE,
  };
}

export const notFound = (what: string) =>
  createError({ statusCode: 404, statusMessage: `${what} not found` });

/** Runs a catalog read; a catalog error becomes a 500 carrying its message. */
export async function guard<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof CatalogError) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
    throw error;
  }
}
