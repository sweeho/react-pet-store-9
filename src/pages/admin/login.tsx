import { CircleAlert, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { safeNext } from "@/components/account/api";
import { Crumbs, Page, inputClass } from "@/components/account/ui";
import { INVENTORY_PATH } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";
import { cn } from "@/utils";

/** Administrator form login (design F7, mockups SWHR8-MCK-53/54). */
export default function AdminLoginPage(): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  const next = useSearchParams()[0].get("next");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    void fetch("/api/admin/signon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: String(data.get("userName") ?? ""),
        password: String(data.get("password") ?? ""),
      }),
    })
      .then((res) => {
        if (res.ok) navigate(safeNext(next, INVENTORY_PATH));
        else setFailed(true);
      })
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));
  }

  return (
    <Page>
      <Crumbs trail={[{ label: t("admin.crumb") }, { label: t("admin.login.crumb") }]} />
      <div className="grid place-items-center pt-12 pb-24">
        <div className="border-border w-full max-w-[420px] rounded-[var(--radius)] border p-8 shadow-xs">
          <div className="bg-secondary grid size-11 place-items-center rounded-md">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em]">
            {t("admin.login.title")}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {t("admin.login.lead")}
          </p>
          {failed ? (
            <div
              role="alert"
              className="text-destructive mt-5 flex gap-3 rounded-[var(--radius)] border border-[color-mix(in_oklch,var(--destructive)_35%,white)] bg-[color-mix(in_oklch,var(--destructive)_5%,white)] px-4 py-3.5 text-sm leading-normal"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-[18px] flex-none" />
              <div>
                <b className="block">{t("admin.login.failed.title")}</b>
                <span className="text-muted-foreground">{t("admin.login.failed.body")}</span>
              </div>
            </div>
          ) : null}
          <form onSubmit={submit} className="mt-6">
            <div className="mb-4">
              <label htmlFor="admin-user" className="mb-2 block text-sm font-medium">
                {t("admin.login.userName")}
              </label>
              <input
                id="admin-user"
                name="userName"
                autoComplete="username"
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
                {t("admin.login.password")}
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={failed}
                className={cn(inputClass, failed && "border-destructive")}
              />
            </div>
            <Button type="submit" disabled={busy} className="mt-2 w-full">
              {busy ? t("admin.login.submitting") : t("admin.login.submit")}
              <Lock aria-hidden="true" className="ml-2 size-4" />
            </Button>
          </form>
          <p className="text-muted-foreground mt-5 text-center text-sm">
            {t("admin.login.back")}{" "}
            <Link to="/" className="text-foreground font-medium underline underline-offset-[3px]">
              {t("admin.login.backLink")}
            </Link>
          </p>
        </div>
      </div>
    </Page>
  );
}
