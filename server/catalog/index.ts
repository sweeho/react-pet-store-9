import { createCatalog } from "./catalog";
import { sqliteSource } from "./source";

/** The catalog every route and in-process caller shares (design C1, task 4.1: source by configuration). */
export const catalog = createCatalog({ source: sqliteSource });
