import { useNavigate, useSearchParams } from "react-router";

import { safeNext } from "@/components/account/api";
import { Crumbs, Page } from "@/components/account/ui";
import { AdminSignOnForm } from "@/components/admin/admin-sign-on-form";
import { INVENTORY_PATH } from "@/components/admin/api";
import { useScreen } from "@/i18n";

/** Administrator form login (design F7, mockups SWHR8-MCK-53/54). */
export default function AdminLoginPage(): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  const next = useSearchParams()[0].get("next");
  return (
    <Page>
      <Crumbs trail={[{ label: t("admin.crumb") }, { label: t("admin.login.crumb") }]} />
      <AdminSignOnForm onSignedOn={() => navigate(safeNext(next, INVENTORY_PATH))} />
    </Page>
  );
}
