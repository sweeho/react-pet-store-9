import { Crumbs, Page, inputClass } from "@/components/account/ui";
import { AdminSubNav, SessionLine } from "@/components/admin/admin-header";
import { ADMIN_PATH } from "@/components/admin/api";
import { AdminApiError, fetchSales } from "@/components/admin/orders-api";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";
import { cn } from "@/utils";

const CATEGORIES = ["BIRDS", "CATS", "DOGS", "FISH", "REPTILES"] as const;
type Mode = "REVENUE" | "QUANTITY";
interface Result {
  mode: Mode;
  category: string;
  totals: { key: string; total: number }[];
}

const format = (mode: Mode, v: number): string =>
  mode === "REVENUE"
    ? v.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : v.toLocaleString("en-US");

/** Sales totals by category or item over a date range (design M6, mockups SWHR8-MCK-65/66). */
export default function AdminSalesPage(): React.JSX.Element {
  const { t } = useScreen();
  const [mode, setMode] = useState<Mode>("REVENUE");
  const [result, setResult] = useState<Result | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = String(data.get("start") ?? "");
    const end = String(data.get("end") ?? "");
    const category = String(data.get("category") ?? "");
    if (!start || !end) {
      setProblem(t("admin.sales.badRange"));
      return;
    }
    setProblem(null);
    setBusy(true);
    fetchSales({ type: mode, start, end, category })
      .then((totals) => setResult({ mode, category, totals }))
      .catch((e: unknown) =>
        setProblem(
          e instanceof AdminApiError && e.status === 401
            ? t("admin.refused.signIn")
            : t("admin.sales.error"),
        ),
      )
      .finally(() => setBusy(false));
  }

  const grand = result?.totals.reduce((sum, r) => sum + r.total, 0) ?? 0;
  return (
    <Page>
      <Crumbs
        trail={[{ to: ADMIN_PATH, label: t("admin.crumb") }, { label: t("admin.sales.crumb") }]}
      />
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold">{t("admin.sales.title")}</h1>
          <p className="text-muted-foreground mt-1.5 max-w-[620px] text-[15px] leading-normal">
            {t("admin.sales.lead")}
          </p>
        </div>
        <SessionLine withLogout />
      </div>
      <AdminSubNav current="sales" />
      <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium">
          <span className="mb-2 block">{t("admin.sales.start")}</span>
          <input name="start" type="date" className={cn(inputClass, "w-44")} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-2 block">{t("admin.sales.end")}</span>
          <input name="end" type="date" className={cn(inputClass, "w-44")} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-2 block">{t("admin.sales.category")}</span>
          <select name="category" className={cn(inputClass, "w-48")}>
            <option value="">{t("admin.sales.allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div
          role="group"
          aria-label={t("admin.sales.show")}
          className="bg-muted flex rounded-md p-1"
        >
          {(["REVENUE", "QUANTITY"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "text-muted-foreground h-8 rounded px-3 text-sm font-medium",
                mode === m && "bg-background text-foreground shadow-xs",
              )}
            >
              {m === "REVENUE" ? t("admin.sales.revenue") : t("admin.sales.quantity")}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={busy}>
          {t("admin.sales.get")}
        </Button>
      </form>
      {problem ? (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {problem}
        </p>
      ) : null}
      {result ? (
        result.totals.length === 0 ? (
          <p className="text-muted-foreground mt-6 text-sm">{t("admin.sales.empty")}</p>
        ) : (
          <div className="border-border mt-6 overflow-x-auto rounded-[var(--radius)] border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-[13px]">
                  <th className="h-11 px-4 font-medium">
                    {result.category ? t("admin.sales.groupItem") : t("admin.sales.groupCategory")}
                  </th>
                  <th className="px-4 text-right font-medium">
                    {result.mode === "REVENUE"
                      ? t("admin.sales.revenue")
                      : t("admin.sales.quantity")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.totals.map((r) => (
                  <tr key={r.key} className="border-border h-12 border-b">
                    <td className="px-4">{r.key}</td>
                    <td className="px-4 text-right tabular-nums">{format(result.mode, r.total)}</td>
                  </tr>
                ))}
                <tr className="bg-muted h-12 font-semibold">
                  <td className="px-4">{t("admin.sales.total")}</td>
                  <td className="px-4 text-right tabular-nums">{format(result.mode, grand)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      ) : null}
      <p className="text-muted-foreground mt-4 mb-16 text-[13px]">{t("admin.sales.note")}</p>
    </Page>
  );
}
