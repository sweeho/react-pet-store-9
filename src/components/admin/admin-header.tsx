import { Clock, LayoutList, ChartColumn, User } from "lucide-react";
import { Link } from "react-router";

import { useScreen } from "@/i18n";
import { cn } from "@/utils";

import { ADMIN_ORDERS_PATH, ADMIN_SALES_PATH, fetchAdminSession } from "./api";
import { LogoutButton } from "./logout-button";

/** "Signed in as <name> · Signs you out after 54 min idle" (mockups SWHR8-MCK-59/61/65). */
export function SessionLine({ withLogout = false }: { withLogout?: boolean }): React.JSX.Element {
  const { t } = useScreen();
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    // Best effort: the name is decoration, so a failed lookup shows the idle note alone.
    fetchAdminSession()
      .then((a) => setName(a?.userName ?? null))
      .catch(() => undefined);
  }, []);
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[13px]">
      <User aria-hidden="true" className="size-3.5" />
      {name ? (
        <span>
          {t("admin.signedInAs", { name: "" })}
          <b className="text-foreground font-medium">{name}</b> ·
        </span>
      ) : null}
      <Clock aria-hidden="true" className="size-3.5" />
      <span>{t("admin.idle")}</span>
      {withLogout ? <LogoutButton /> : null}
    </div>
  );
}

/** The Orders / Sales totals sub-navigation. */
export function AdminSubNav({ current }: { current: "orders" | "sales" }): React.JSX.Element {
  const { t } = useScreen();
  const tab = (active: boolean) =>
    cn(
      "-mb-px inline-flex items-center gap-2 border-b-2 border-transparent py-2.5 text-sm font-medium",
      active ? "text-foreground border-foreground" : "text-muted-foreground hover:text-foreground",
    );
  return (
    <nav aria-label="Administration" className="border-border mt-6 flex gap-6 border-b">
      <Link
        to={ADMIN_ORDERS_PATH}
        aria-current={current === "orders" ? "page" : undefined}
        className={tab(current === "orders")}
      >
        <LayoutList aria-hidden="true" className="size-4" />
        {t("admin.nav.orders")}
      </Link>
      <Link
        to={ADMIN_SALES_PATH}
        aria-current={current === "sales" ? "page" : undefined}
        className={tab(current === "sales")}
      >
        <ChartColumn aria-hidden="true" className="size-4" />
        {t("admin.nav.sales")}
      </Link>
    </nav>
  );
}
