import { Check, Info, RefreshCw } from "lucide-react";

import { Crumbs, Page } from "@/components/account/ui";
import { AdminSignOnForm } from "@/components/admin/admin-sign-on-form";
import { AdminSubNav, SessionLine } from "@/components/admin/admin-header";
import { ADMIN_PATH } from "@/components/admin/api";
import {
  AdminApiError,
  fetchOrders,
  ORDER_STATUSES,
  updateStatus,
  type AdminOrderRow,
  type OrderStatusName,
} from "@/components/admin/orders-api";
import { EmptyFrame, ErrorFrame, LoadingFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";
import { cn } from "@/utils";

type Lists = Record<OrderStatusName, { orders: AdminOrderRow[]; count: number }>;
type Load =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "signedOut" }
  | { kind: "refused" }
  | { kind: "ready"; lists: Lists };

const DECISIONS = ["PENDING", "APPROVED", "DENIED"] as const;
const DOT: Record<string, string> = {
  APPROVED: "var(--chart-2)",
  DENIED: "var(--destructive)",
  COMPLETED: "var(--chart-3)",
};

async function loadLists(): Promise<Load> {
  try {
    const results = await Promise.all(ORDER_STATUSES.map((s) => fetchOrders(s)));
    const lists = Object.fromEntries(ORDER_STATUSES.map((s, i) => [s, results[i]])) as Lists;
    return { kind: "ready", lists };
  } catch (e) {
    if (e instanceof AdminApiError && e.status === 401) return { kind: "signedOut" };
    if (e instanceof AdminApiError && e.status === 403) return { kind: "refused" };
    return { kind: "error" };
  }
}

const money = (v: number): string =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Order lists by status with approve/deny, Commit and Refresh (design M8, mockups SWHR8-MCK-61/62/63/64). */
export default function AdminOrdersPage(): React.JSX.Element {
  const { t } = useScreen();
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [tab, setTab] = useState<OrderStatusName>("PENDING");
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<"sent" | "failed" | null>(null);

  const reload = useCallback(() => {
    void loadLists().then((next) => {
      setLoad(next);
      setDecisions({});
    });
  }, []);
  useEffect(reload, [reload]);

  const changed = Object.entries(decisions).filter(([, status]) => status !== "PENDING");
  const unsaved = changed.length;

  function refresh() {
    if (unsaved > 0 && !window.confirm(t("admin.orders.confirm", { count: String(unsaved) }))) {
      return;
    }
    setNotice(null);
    reload();
  }

  function commit() {
    if (unsaved === 0) return;
    const sets = (["APPROVED", "DENIED"] as const)
      .map((status) =>
        changed.filter(([, s]) => s === status).map(([orderId]) => ({ orderId, status })),
      )
      .filter((orders) => orders.length > 0);
    void Promise.all(sets.map((orders) => updateStatus(orders))).then(
      () => {
        setNotice("sent");
        reload();
      },
      () => setNotice("failed"),
    );
  }

  const pageHead = (
    <>
      <Crumbs
        trail={[{ to: ADMIN_PATH, label: t("admin.crumb") }, { label: t("admin.orders.crumb") }]}
      />
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold">{t("admin.orders.title")}</h1>
          <p className="text-muted-foreground mt-1.5 text-[15px] leading-normal">
            {t("admin.orders.lead")}
          </p>
        </div>
        <SessionLine withLogout />
      </div>
      <AdminSubNav current="orders" />
    </>
  );

  if (load.kind === "signedOut") {
    return (
      <Page>
        <Crumbs trail={[{ label: t("admin.crumb") }]} />
        <AdminSignOnForm
          onSignedOn={reload}
          title={t("admin.entry.title")}
          lead={t("admin.entry.body")}
        />
      </Page>
    );
  }

  return (
    <Page>
      {pageHead}
      {load.kind === "loading" ? <LoadingFrame label={t("admin.loading")} /> : null}
      {load.kind === "error" ? (
        <ErrorFrame
          title={t("admin.orders.error.title")}
          message={t("admin.orders.error.body")}
          onRetry={reload}
        />
      ) : null}
      {load.kind === "refused" ? (
        <EmptyFrame title={t("admin.refused.denied")} message={t("admin.entry.body")} />
      ) : null}
      {load.kind === "ready" ? (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              className="bg-muted inline-flex gap-0.5 rounded-[var(--radius)] p-1"
            >
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={tab === s}
                  onClick={() => setTab(s)}
                  className={cn(
                    "text-muted-foreground inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium",
                    tab === s && "bg-background text-foreground shadow-xs",
                  )}
                >
                  {t(`admin.orders.tab.${s}`)}
                  <span className="border-border bg-background text-muted-foreground rounded-full border px-[7px] text-xs">
                    {load.lists[s].count.toLocaleString("en-US")}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {tab === "PENDING" ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-[13px]",
                    unsaved > 0 ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  <i
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ background: unsaved > 0 ? "var(--chart-5)" : "var(--border)" }}
                  />
                  {unsaved === 0
                    ? t("admin.orders.unsaved.none")
                    : unsaved === 1
                      ? t("admin.orders.unsaved.one")
                      : t("admin.orders.unsaved.many", { count: String(unsaved) })}
                </span>
              ) : null}
              <Button type="button" variant="outline" onClick={refresh}>
                <RefreshCw aria-hidden="true" className="mr-2 size-4" />
                {t("admin.orders.refresh")}
              </Button>
              {tab === "PENDING" ? (
                <Button type="button" onClick={commit}>
                  <Check aria-hidden="true" className="mr-2 size-4" />
                  {t("admin.orders.commit")}
                </Button>
              ) : null}
            </div>
          </div>
          {tab === "PENDING" ? (
            <p className="text-muted-foreground mt-3 flex gap-2 text-[13px] leading-normal">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 flex-none" />
              {t("admin.orders.help")}
            </p>
          ) : null}
          {notice ? (
            <p
              role={notice === "failed" ? "alert" : "status"}
              className={cn(
                "mt-3 text-sm",
                notice === "failed" ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {notice === "sent" ? t("admin.orders.sent") : t("admin.orders.sendFailed")}
            </p>
          ) : null}
          <OrderTable
            status={tab}
            orders={load.lists[tab].orders}
            count={load.lists[tab].count}
            decisions={decisions}
            onDecide={(orderId, status) => {
              setNotice(null);
              setDecisions((d) => ({ ...d, [orderId]: status }));
            }}
          />
        </>
      ) : null}
    </Page>
  );
}

function OrderTable({
  status,
  orders,
  count,
  decisions,
  onDecide,
}: {
  status: OrderStatusName;
  orders: AdminOrderRow[];
  count: number;
  decisions: Record<string, string>;
  onDecide: (orderId: string, status: string) => void;
}): React.JSX.Element {
  const { t } = useScreen();
  if (orders.length === 0) {
    return (
      <EmptyFrame
        title={t("admin.orders.empty", { status: t(`admin.orders.tab.${status}`) })}
        message=""
      />
    );
  }
  return (
    <div className="border-border mt-4 mb-16 overflow-x-auto rounded-[var(--radius)] border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left text-[13px] font-medium">
            <th className="h-11 px-4 font-medium">{t("admin.orders.col.id")}</th>
            <th className="px-4 font-medium">{t("admin.orders.col.user")}</th>
            <th className="px-4 font-medium">{t("admin.orders.col.date")}</th>
            <th className="px-4 text-right font-medium">{t("admin.orders.col.value")}</th>
            <th className="px-4 font-medium">{t("admin.orders.col.status")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const chosen = decisions[o.orderId] ?? o.status;
            return (
              <tr
                key={o.orderId}
                data-order-id={o.orderId}
                className={cn(
                  "border-border h-[52px] border-b last:border-b-0",
                  status === "PENDING" && chosen !== "PENDING"
                    ? "bg-[color-mix(in_oklch,var(--chart-4)_12%,white)]"
                    : "hover:bg-muted/50",
                )}
              >
                <td className="px-4 font-mono text-[13px]">{o.orderId}</td>
                <td className="px-4">{o.userId}</td>
                <td className="px-4 font-mono text-[13px]">{o.date}</td>
                <td className="px-4 text-right tabular-nums">{money(o.value)}</td>
                <td className="px-4">
                  {status === "PENDING" ? (
                    <select
                      aria-label={t("admin.orders.col.status")}
                      value={chosen}
                      onChange={(e) => onDecide(o.orderId, e.target.value)}
                      className="border-input bg-background h-8 min-w-[140px] rounded-md border px-2.5 text-[13px] font-medium"
                    >
                      {DECISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-[9px] py-0.5 text-xs font-medium">
                      <i
                        aria-hidden="true"
                        className="size-1.5 rounded-full"
                        style={{ background: DOT[o.status] ?? "var(--border)" }}
                      />
                      {o.status}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-border text-muted-foreground border-t px-4 py-3 text-[13px]">
        {t("admin.orders.count", { count: count.toLocaleString("en-US") })}
      </div>
    </div>
  );
}
