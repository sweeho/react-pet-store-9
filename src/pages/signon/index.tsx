import { useSearchParams } from "react-router";

import { NewCustomerPanel, SignOnForm } from "@/components/account/sign-on-form";
import { Alert, Crumbs, Page } from "@/components/account/ui";
import { useScreen } from "@/i18n";

export default function SignOnPage(): React.JSX.Element {
  const { t } = useScreen();
  const next = useSearchParams()[0].get("next");
  return (
    <Page>
      <Crumbs trail={[{ label: t("area.account.label") }, { label: t("signon.crumb") }]} />
      <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.025em]">{t("signon.title")}</h1>
      <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed">{t("signon.lead")}</p>
      <div className="max-w-[960px]">
        {next ? <Alert title={t("signon.next.title")}>{t("signon.next.body")}</Alert> : null}
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          <SignOnForm next={next} />
          <NewCustomerPanel next={next} />
        </div>
      </div>
    </Page>
  );
}
