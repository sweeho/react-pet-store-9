import { defineHandler, getQuery, HTTPError } from "nitro/h3";

import { requireAdministrator } from "../../../server/admin/auth";
import { readSalesLines } from "../../../server/admin/orders";
import { salesTotals } from "../../../server/lib/admin-sales";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// REVENUE / any other type: totals per category, or per item within `category`, over a date range.
export default defineHandler((event) => {
  requireAdministrator(event);
  const q = getQuery(event);
  const text = (v: unknown): string => (typeof v === "string" ? v : "");
  const [type, start, end, category] = [q.type, q.start, q.end, q.category].map(text);
  if (!DATE.test(start) || !DATE.test(end)) {
    throw new HTTPError({ status: 400, message: "start and end must be dates (yyyy-mm-dd)" });
  }
  const totals = salesTotals({
    lines: readSalesLines(),
    type,
    start,
    end,
    category: category || undefined,
  })
    .map((t) => ({
      key: t.key,
      total: type === "REVENUE" ? Math.round(t.total * 100) / 100 : t.total,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  return { totals };
});
