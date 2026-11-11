import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { postJson } from "@/components/account/api";
import { CustomerForm } from "@/components/account/customer-form";
import type { CustomerValues } from "@/components/account/customer-values";
import { Crumbs, Field, inputClass, Page } from "@/components/account/ui";
import { LoadingFrame, ErrorFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

interface CustomerData extends CustomerValues {
  userName: string;
  status: string;
}

async function loadCustomer(): Promise<CustomerData> {
  const res = await fetch("/api/customer");
  if (!res.ok) throw new Error(`GET /api/customer failed: ${res.status}`);
  return (await res.json()) as CustomerData;
}

/** My Account: the signed-on customer's profile form (design A9). Sign-on is required by the shell guard. */
export default function AccountPage(): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  const { status, data, retry } = useLoad(loadCustomer);
  if (status === "loading") return <LoadingFrame />;
  if (status === "error" || !data) return <ErrorFrame onRetry={retry} />;
  return (
    <Page>
      <Crumbs trail={[{ label: t("account.crumb") }]} />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.025em]">{t("account.title")}</h1>
          <div className="mt-2 flex items-center gap-2.5 text-sm">
            <span className="bg-muted grid size-7 place-items-center rounded-full text-[11px] font-semibold uppercase">
              {data.userName.slice(0, 2)}
            </span>
            {data.userName}
            <span className="border-border rounded-full border px-2 py-0.5 text-xs capitalize">
              {data.status === "active" ? t("account.active") : data.status}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => void postJson("/api/signoff", {}).then(() => navigate("/"))}
        >
          <LogOut aria-hidden="true" className="mr-2 size-4" />
          {t("header.signOff")}
        </Button>
      </div>
      <div className="max-w-[860px]">
        <div className="border-border grid gap-4 border-b py-6 md:grid-cols-[240px_1fr] md:gap-8">
          <div>
            <h3 className="text-[15px] font-semibold">{t("account.signon")}</h3>
            <p className="text-muted-foreground mt-1 text-[13px]">{t("account.signon.hint")}</p>
          </div>
          <Field label={t("field.userName")} className="mt-0">
            <input
              readOnly
              value={data.userName}
              className={`${inputClass} bg-muted text-muted-foreground`}
            />
          </Field>
        </div>
        <CustomerForm mode="edit" initial={data} />
      </div>
    </Page>
  );
}
