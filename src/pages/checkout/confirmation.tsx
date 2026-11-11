import { Check, Grid2x2, House, Mail } from "lucide-react";
import { Link, useLocation } from "react-router";

import { EmptyFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

interface Placed {
  orderNumber: number | string;
  email?: string;
}

const isPlaced = (v: unknown): v is Placed =>
  typeof v === "object" && v !== null && "orderNumber" in v;

/** The confirmation: order number and bill-to e-mail (the e-mail row is omitted when blank). */
export default function ConfirmationPage(): React.JSX.Element {
  const { t } = useScreen();
  const { state } = useLocation() as { state: unknown };
  if (!isPlaced(state)) {
    return (
      <EmptyFrame title={t("checkout.confirm.noneTitle")} message={t("checkout.confirm.noneBody")}>
        <Button asChild>
          <Link to="/cart">{t("orderError.cart")}</Link>
        </Button>
      </EmptyFrame>
    );
  }
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center px-4 pt-16 pb-[72px] text-center">
      <span className="grid size-16 place-items-center rounded-full bg-[color-mix(in_oklch,var(--chart-2)_14%,white)] text-[var(--chart-2)]">
        <Check aria-hidden="true" className="size-7" />
      </span>
      <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.02em]">
        {t("checkout.confirm.title")}
      </h1>
      <p className="text-muted-foreground mt-2.5 text-base leading-[1.55]">
        {t("checkout.confirm.body")}
      </p>
      <div className="border-border mt-7 w-full rounded-[var(--radius)] border p-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-left text-sm">
          <dt className="text-muted-foreground">{t("checkout.confirm.number")}</dt>
          <dd className="font-medium">
            <span className="bg-secondary border-border rounded-md border px-2 py-0.5 font-mono text-[13px]">
              {state.orderNumber}
            </span>
          </dd>
          {state.email ? (
            <>
              <dt className="text-muted-foreground">{t("checkout.confirm.email")}</dt>
              <dd className="flex items-center gap-1.5 font-medium [overflow-wrap:anywhere]">
                <Mail aria-hidden="true" className="text-muted-foreground size-3.5" />
                {state.email}
              </dd>
            </>
          ) : null}
        </dl>
      </div>
      <p className="text-muted-foreground mt-4 text-[13px]">{t("checkout.confirm.cartEmpty")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link to="/catalog">
            <Grid2x2 aria-hidden="true" className="mr-2 size-4" />
            {t("checkout.confirm.continue")}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/">
            <House aria-hidden="true" className="mr-2 size-4" />
            {t("checkout.confirm.home")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
