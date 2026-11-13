import { ArrowRight, ListChecks, LogOut } from "lucide-react";
import { Link } from "react-router";

import { Crumbs, Page } from "@/components/account/ui";
import { AdminSignOnForm } from "@/components/admin/admin-sign-on-form";
import { SessionLine } from "@/components/admin/admin-header";
import { ADMIN_ORDERS_PATH, fetchAdminSession, type AdminSession } from "@/components/admin/api";
import { LogoutButton } from "@/components/admin/logout-button";
import { ErrorFrame, LoadingFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

/**
 * Administration launcher (design M8, mockups SWHR8-MCK-57..60). Anyone who is not signed on as an
 * administrator gets the sign-on form in place, with no "Manage orders".
 */
export default function AdminIndexPage(): React.JSX.Element {
  const { t } = useScreen();
  const { status, data, retry } = useLoad<AdminSession | null>(fetchAdminSession);
  const isAdmin = data?.isAdministrator === true;
  return (
    <Page>
      <Crumbs trail={[{ label: t("admin.crumb") }]} />
      {status === "loading" ? <LoadingFrame label={t("admin.loading")} /> : null}
      {status === "error" ? (
        <ErrorFrame
          title={t("admin.orders.error.title")}
          message={t("admin.orders.error.body")}
          onRetry={retry}
        />
      ) : null}
      {status === "ready" && !isAdmin ? (
        <AdminSignOnForm
          onSignedOn={retry}
          title={t("admin.entry.title")}
          lead={t("admin.entry.body")}
        />
      ) : null}
      {status === "ready" && isAdmin ? <Launcher /> : null}
    </Page>
  );
}

function Launcher(): React.JSX.Element {
  const { t } = useScreen();
  return (
    <>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold">{t("admin.launcher.title")}</h1>
          <p className="text-muted-foreground mt-1.5 text-[15px] leading-normal">
            {t("admin.launcher.lead")}
          </p>
        </div>
        <SessionLine />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="border-border rounded-[var(--radius)] border p-6">
          <div className="bg-secondary grid size-10 place-items-center rounded-md">
            <ListChecks aria-hidden="true" className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("admin.launcher.manage.title")}</h2>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {t("admin.launcher.manage.body")}
          </p>
          <Button asChild className="mt-5">
            <Link to={ADMIN_ORDERS_PATH}>
              {t("admin.launcher.manage.open")}
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </Button>
        </section>
        <section className="border-border rounded-[var(--radius)] border p-6">
          <div className="bg-secondary grid size-10 place-items-center rounded-md">
            <LogOut aria-hidden="true" className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("admin.logout")}</h2>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {t("admin.launcher.logout.body")}
          </p>
          <div className="mt-5">
            <LogoutButton variant="outline" />
          </div>
        </section>
      </div>
      <p className="text-muted-foreground mt-6 mb-16 text-[13px] leading-relaxed">
        {t("admin.launcher.note")}
      </p>
    </>
  );
}
