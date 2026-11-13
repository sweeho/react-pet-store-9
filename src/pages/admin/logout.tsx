import { LogOut } from "lucide-react";
import { Link } from "react-router";

import { Crumbs, Page } from "@/components/account/ui";
import { ADMIN_PATH } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

/** Administrator logged-out page (mockups SWHR8-MCK-67/68). It has no logout control. */
export default function AdminLogoutPage(): React.JSX.Element {
  const { t } = useScreen();
  return (
    <Page>
      <Crumbs trail={[{ label: t("admin.loggedOut.crumb") }]} />
      <div className="border-border my-10 flex flex-col items-center rounded-[var(--radius)] border border-dashed px-8 py-[72px] text-center">
        <div className="bg-secondary grid size-14 place-items-center rounded-full">
          <LogOut aria-hidden="true" className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em]">
          {t("admin.loggedOut.title")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-[460px] text-[15px] leading-relaxed">
          {t("admin.loggedOut.body")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to={ADMIN_PATH}>{t("admin.loggedOut.signIn")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">{t("admin.loggedOut.back")}</Link>
          </Button>
        </div>
      </div>
    </Page>
  );
}
