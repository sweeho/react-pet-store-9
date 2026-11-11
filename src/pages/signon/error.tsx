import { useSearchParams } from "react-router";

import { NewCustomerPanel, SignOnForm } from "@/components/account/sign-on-form";
import { Alert, Crumbs, Page } from "@/components/account/ui";
import { useScreen } from "@/i18n";

export default function SignOnErrorPage(): React.JSX.Element {
  const { t } = useScreen();
  const next = useSearchParams()[0].get("next");
  return (
    <Page>
      <Crumbs
        trail={[
          {
            to: next ? `/signon?next=${encodeURIComponent(next)}` : "/signon",
            label: t("area.account.label"),
          },
          { label: t("signon.error.crumb") },
        ]}
      />
      <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.025em]">
        {t("signon.error.title")}
      </h1>
      <div className="max-w-[960px]">
        <Alert tone="error" title={t("signon.error.alert")}>
          {t("signon.error.body")}
        </Alert>
        <div className="mt-6 grid items-start gap-4 md:grid-cols-[1.2fr_.8fr]">
          <SignOnForm next={next} />
          <NewCustomerPanel next={next} muted />
        </div>
      </div>
    </Page>
  );
}
