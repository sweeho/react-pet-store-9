import { Link } from "react-router";

import { Alert, Crumbs, Page } from "@/components/account/ui";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

/** The Order Error page: an order was submitted with an empty cart (design K7). */
export default function OrderErrorPage(): React.JSX.Element {
  const { t } = useScreen();
  return (
    <Page>
      <Crumbs trail={[{ label: t("cart.crumb"), to: "/cart" }, { label: t("orderError.crumb") }]} />
      <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.025em]">
        {t("orderError.title")}
      </h1>
      <div className="mt-6 max-w-[640px]">
        <Alert tone="error" title={t("orderError.alert")}>
          {t("orderError.body")}
        </Alert>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/catalog">{t("orderError.catalog")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/cart">{t("orderError.cart")}</Link>
          </Button>
        </div>
      </div>
    </Page>
  );
}
