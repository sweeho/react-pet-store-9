import { CircleCheck, ShieldAlert, User } from "lucide-react";
import { Link, Navigate } from "react-router";

import { postJson } from "@/components/account/api";
import { Crumbs, Page } from "@/components/account/ui";
import {
  fetchAdminSession,
  fetchInventory,
  INVENTORY_PATH,
  loginPath,
  readEntry,
  type AdminSession,
  type InventoryItem,
} from "@/components/admin/api";
import { LogoutButton } from "@/components/admin/logout-button";
import { Button } from "@/components/ui/button";
import { EmptyFrame, ErrorFrame, LoadingFrame } from "@/components/shell";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";
import { cn } from "@/utils";

type Loaded =
  | { kind: "signedOut" }
  | { kind: "refused"; admin: AdminSession }
  | { kind: "ready"; admin: AdminSession; items: InventoryItem[] };

async function load(): Promise<Loaded> {
  const admin = await fetchAdminSession();
  if (!admin) return { kind: "signedOut" };
  if (!admin.isAdministrator) return { kind: "refused", admin };
  return { kind: "ready", admin, items: await fetchInventory() };
}

const COLUMNS = "md:grid-cols-[110px_1fr_150px_300px]";

function Refused({ admin }: { admin: AdminSession }): React.JSX.Element {
  const { t } = useScreen();
  return (
    <div className="border-border my-10 flex flex-col items-center rounded-[var(--radius)] border border-dashed px-8 py-[72px] text-center">
      <div className="text-destructive grid size-14 place-items-center rounded-full bg-[color-mix(in_oklch,var(--destructive)_8%,white)]">
        <ShieldAlert aria-hidden="true" className="size-6" />
      </div>
      <p className="text-destructive mt-4 text-sm font-semibold">{t("admin.refused.denied")}</p>
      <h1 className="mt-1 max-w-[480px] text-2xl font-semibold tracking-[-0.02em]">
        {t("admin.refused.title")}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-[460px] text-[15px] leading-relaxed">
        {t("admin.refused.body", { name: admin.userName })}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to={loginPath(INVENTORY_PATH)}>{t("admin.refused.signIn")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">{t("admin.refused.home")}</Link>
        </Button>
        <LogoutButton variant="outline" />
      </div>
    </div>
  );
}

function Editor({
  admin,
  initialItems,
}: {
  admin: AdminSession;
  initialItems: InventoryItem[];
}): React.JSX.Element {
  const { t } = useScreen();
  const [items, setItems] = useState(initialItems);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const changes = items.filter((i) => readEntry(entries[i.itemId] ?? "").kind === "change");
  const count = changes.length;

  function save() {
    setBusy(true);
    setFailed(false);
    const quantities = Object.fromEntries(
      Object.entries(entries).filter(([, v]) => v.trim() !== ""),
    );
    void postJson("/api/admin/inventory", { quantities })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        setEntries({});
        setSaved(true);
        // Show the new on-hand quantities without leaving the page, so the banner stays up.
        return fetchInventory().then(setItems);
      })
      .catch(() => {
        setSaved(false);
        setFailed(true);
      })
      .finally(() => setBusy(false));
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.025em]">
            {t("admin.inventory.title")}
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-[620px] text-[15px] leading-normal">
            {t("admin.inventory.lead")}
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <User aria-hidden="true" className="size-4" />
          <span>
            {t("admin.signedInAs", { name: "" })}
            <b className="text-foreground font-medium">{admin.userName}</b>
          </span>
          <LogoutButton />
        </div>
      </div>

      {saved ? (
        <div
          role="status"
          className="border-border bg-muted mt-5 flex gap-3 rounded-[var(--radius)] border px-4 py-3.5 text-sm leading-normal"
        >
          <CircleCheck
            aria-hidden="true"
            className="mt-0.5 size-[18px] flex-none text-[oklch(0.55_0.15_150)]"
          />
          <div>
            <b className="block font-semibold">{t("admin.inventory.saved.title")}</b>
            <span className="text-muted-foreground">{t("admin.inventory.saved.body")}</span>
          </div>
        </div>
      ) : null}
      {failed ? (
        <p role="alert" className="text-destructive mt-5 text-sm">
          {t("admin.inventory.saveFailed")}
        </p>
      ) : null}

      <div className="border-border bg-card mt-6 mb-16 rounded-[var(--radius)] border">
        <div
          className={cn(
            "bg-muted text-muted-foreground hidden h-11 items-center gap-4 rounded-t-[var(--radius)] border-b px-4 text-[13px] font-medium md:grid",
            COLUMNS,
          )}
        >
          <span>{t("admin.inventory.col.item")}</span>
          <span>{t("admin.inventory.col.description")}</span>
          <span className="text-right">{t("admin.inventory.col.onHand")}</span>
          <span className="text-right">{t("admin.inventory.col.newQuantity")}</span>
        </div>
        <ul>
          {items.map((i) => {
            const text = entries[i.itemId] ?? "";
            const entry = readEntry(text);
            return (
              <li
                key={i.itemId}
                className={cn(
                  "border-border hover:bg-muted/50 grid items-start gap-x-4 gap-y-2 border-b px-4 py-2 text-sm",
                  COLUMNS,
                )}
              >
                <span className="pt-2 font-mono text-[13px] md:pt-4">{i.itemId}</span>
                <div className="md:pt-2">
                  <div className="font-medium">{i.description}</div>
                  {i.productId ? (
                    <div className="text-muted-foreground mt-0.5 text-[13px]">
                      {i.productId}
                      {i.productName ? ` · ${i.productName}` : ""}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-baseline justify-between gap-2 md:block md:pt-4 md:text-right">
                  <span className="text-muted-foreground text-[13px] md:hidden">
                    {t("admin.inventory.col.onHand")}
                  </span>
                  <span className="font-medium tabular-nums">
                    {i.quantity.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="relative">
                  <input
                    inputMode="numeric"
                    placeholder="—"
                    aria-label={t("admin.inventory.newQuantityFor", { item: i.itemId })}
                    value={text}
                    onChange={(e) => setEntries({ ...entries, [i.itemId]: e.target.value })}
                    className={cn(
                      "border-input bg-background focus-visible:ring-ring ml-auto block h-9 w-full rounded-md border px-3 text-right text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none md:w-[120px]",
                      entry.kind === "ignored" && "border-destructive",
                      entry.kind === "change" && "border-primary",
                    )}
                  />
                  {entry.kind !== "blank" ? (
                    <span
                      className={cn(
                        "mt-1 block text-right text-xs md:pointer-events-none md:absolute md:top-2.5 md:right-[140px] md:mt-0",
                        entry.kind === "ignored" ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {entry.kind === "ignored"
                        ? t("admin.inventory.ignored")
                        : t("admin.inventory.was", { quantity: String(i.quantity) })}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="bg-muted sticky bottom-0 flex flex-wrap items-center gap-3 rounded-b-[var(--radius)] border-t px-4 py-3.5 shadow-[0_-4px_12px_rgb(0_0_0/0.04)]">
          <span className="text-sm font-medium">
            {count === 0
              ? t("admin.inventory.none")
              : count === 1
                ? t("admin.inventory.one")
                : t("admin.inventory.many", { count: String(count) })}
          </span>
          <span className="flex-1" />
          <span className="text-muted-foreground mr-2 text-[13px]">
            {t("admin.inventory.note")}
          </span>
          <Button type="button" variant="outline" onClick={() => setEntries({})}>
            {t("admin.inventory.clear")}
          </Button>
          <Button type="button" disabled={count === 0 || busy} onClick={save}>
            {busy ? t("admin.inventory.saving") : t("admin.inventory.save")}
          </Button>
        </div>
      </div>
    </>
  );
}

/** Inventory update (design F8, mockups SWHR8-MCK-51/52/55/56). */
export default function InventoryPage(): React.JSX.Element {
  const { t } = useScreen();
  const { status, data, retry } = useLoad(load);
  const refused = data?.kind === "refused";
  return (
    <Page>
      <Crumbs trail={[{ label: t("admin.crumb") }, { label: t("admin.inventory.crumb") }]} />
      {status === "loading" ? <LoadingFrame label={t("admin.inventory.loading")} /> : null}
      {status === "error" ? (
        <ErrorFrame
          title={t("admin.inventory.error.title")}
          message={t("admin.inventory.error.body")}
          onRetry={retry}
        />
      ) : null}
      {data?.kind === "signedOut" ? <Navigate to={loginPath(INVENTORY_PATH)} replace /> : null}
      {refused ? <Refused admin={data.admin} /> : null}
      {data?.kind === "ready" && data.items.length === 0 ? (
        <EmptyFrame
          title={t("admin.inventory.empty.title")}
          message={t("admin.inventory.empty.body")}
        />
      ) : null}
      {data?.kind === "ready" && data.items.length > 0 ? (
        <Editor admin={data.admin} initialItems={data.items} />
      ) : null}
    </Page>
  );
}
