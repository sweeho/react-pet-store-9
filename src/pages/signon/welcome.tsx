import { LayoutGrid, Globe, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { postJson } from "@/components/account/api";
import { Crumbs, Page } from "@/components/account/ui";
import { Thumb } from "@/components/catalog/thumb";
import { Button } from "@/components/ui/button";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

interface Welcome {
  userName: string;
  firstName?: string;
  banner?: boolean;
  bannerCategory?: string;
}

async function loadWelcome(): Promise<Welcome> {
  const session = (await (await fetch("/api/session")).json()) as Welcome;
  const res = await fetch("/api/customer");
  const customer = res.ok ? ((await res.json()) as { firstName?: string }) : {};
  return { ...session, firstName: customer.firstName };
}

const titleCase = (id: string) => id.charAt(0) + id.slice(1).toLowerCase();

export default function WelcomePage(): React.JSX.Element | null {
  const { t } = useScreen();
  const navigate = useNavigate();
  const { data } = useLoad(loadWelcome);
  if (!data) return null;
  const tiles = [
    { to: "/catalog", icon: LayoutGrid, title: t("welcome.shop"), hint: t("welcome.shop.hint") },
    { to: "/account", icon: User, title: t("welcome.account"), hint: t("welcome.account.hint") },
    { to: "/locale", icon: Globe, title: t("welcome.language"), hint: t("welcome.language.hint") },
  ];
  return (
    <Page>
      <Crumbs trail={[{ label: t("welcome.crumb") }]} />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.025em]">
            {t("welcome.title", { name: data.firstName || data.userName })}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px]">
            {t("welcome.lead", { name: data.userName })}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void postJson("/api/signoff", {}).then(() => navigate("/"))}
        >
          <LogOut aria-hidden="true" className="mr-2 size-4" />
          {t("header.signOff")}
        </Button>
      </div>
      {data.banner !== false && data.bannerCategory ? (
        <div className="border-border bg-muted/40 mt-6 flex items-center gap-4 rounded-[var(--radius)] border p-4">
          <Thumb categoryId={data.bannerCategory} className="size-14" iconSize={28} />
          <div>
            <b className="text-base">{titleCase(data.bannerCategory)}</b>
            <p className="text-muted-foreground text-[13px]">{t("welcome.banner.hint")}</p>
          </div>
        </div>
      ) : null}
      <h2 className="mt-8 text-lg font-semibold">{t("welcome.next")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ to, icon: Icon, title, hint }) => (
          <Link
            key={to}
            to={to}
            className="border-border hover:bg-accent flex gap-3.5 rounded-[var(--radius)] border p-4"
          >
            <span className="bg-muted grid size-10 flex-none place-items-center rounded-md">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold">{title}</h3>
              <p className="text-muted-foreground text-[13px]">{hint}</p>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}
