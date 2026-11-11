import { Check } from "lucide-react";
import { useSearchParams } from "react-router";

import { useAccountSession } from "@/components/account/api";
import { CustomerForm } from "@/components/account/customer-form";
import { EMPTY_CUSTOMER } from "@/components/account/customer-values";
import { Crumbs, Page } from "@/components/account/ui";
import { useScreen } from "@/i18n";

/** Step 2 of registration: the customer form (design A9). */
export default function NewCustomerPage(): React.JSX.Element {
  const { t } = useScreen();
  const next = useSearchParams()[0].get("next");
  const session = useAccountSession("account/new");
  return (
    <Page>
      <Crumbs
        trail={[{ to: "/signon", label: t("area.account.label") }, { label: t("register.crumb") }]}
      />
      <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-3 text-[13px]">
        <span className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full">
            <Check aria-hidden="true" className="size-3" />
          </span>
          {t("customer.step1")}
        </span>
        <hr className="border-border w-8" />
        <span className="text-foreground flex items-center gap-2 font-medium">
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full text-[11px]">
            2
          </span>
          {t("customer.step2")}
        </span>
      </div>
      <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.025em]">
        {t("customer.new.title")}
      </h1>
      <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed">
        {t("customer.new.lead", { name: session?.userName ?? "" })}
      </p>
      <div className="max-w-[860px]">
        <CustomerForm mode="new" initial={EMPTY_CUSTOMER} next={next} />
      </div>
    </Page>
  );
}
