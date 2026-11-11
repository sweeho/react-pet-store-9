import { CircleAlert } from "lucide-react";
import { Link } from "react-router";

import { Crumbs, Page } from "@/components/account/ui";
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
      <div
        data-testid="order-error"
        className="border-border mt-6 flex flex-col items-center rounded-[var(--radius)] border px-6 py-12 text-center"
      >
        <div className="bg-destructive/10 text-destructive mb-5 grid size-14 place-items-center rounded-full">
          <CircleAlert aria-hidden="true" className="size-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{t("orderError.alert")}</h2>
        <p className="text-muted-foreground mt-2 max-w-[420px] text-[15px] leading-relaxed">
          {t("orderError.body")}
        </p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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
