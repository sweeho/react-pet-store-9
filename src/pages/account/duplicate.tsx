import { User } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Crumbs, Page, Panel } from "@/components/account/ui";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

export default function DuplicateAccountPage(): React.JSX.Element {
  const { t } = useScreen();
  const name = useSearchParams()[0].get("name") ?? "";
  return (
    <Page>
      <Crumbs
        trail={[{ to: "/signon", label: t("area.account.label") }, { label: t("duplicate.crumb") }]}
      />
      <Panel className="mx-auto mt-16 max-w-[560px]">
        <span className="bg-muted grid size-11 place-items-center rounded-md">
          <User aria-hidden="true" className="size-[22px]" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.025em]">{t("duplicate.title")}</h1>
        <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed">
          {t("duplicate.lead", { name })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/register">{t("duplicate.another")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signon">{t("duplicate.signon", { name })}</Link>
          </Button>
        </div>
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground mt-5 block text-[13px] underline underline-offset-[3px]"
        >
          {t("duplicate.back")}
        </Link>
      </Panel>
    </Page>
  );
}
