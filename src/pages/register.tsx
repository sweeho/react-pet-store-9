import { ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { postJson, safeNext } from "@/components/account/api";
import { Alert, Crumbs, Field, inputClass, Page, Panel } from "@/components/account/ui";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

/** Step 1 of registration: user name and password. Step 2 is /account/new (design A9). */
export default function RegisterPage(): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  const next = useSearchParams()[0].get("next");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = String(data.get("userName") ?? "").trim();
    setBusy(true);
    setFailed(false);
    void postJson("/api/register", { userName, password: String(data.get("password") ?? "") })
      .then((res) => {
        // A visitor sent here from a protected page goes straight back to it (design A5, D2);
        // otherwise registration continues with the customer form.
        if (res.ok) navigate(next ? safeNext(next) : "/account/new");
        else if (res.status === 409)
          navigate(`/account/duplicate?name=${encodeURIComponent(userName)}`);
        else setFailed(true);
      })
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));
  }

  return (
    <Page>
      <Crumbs
        trail={[
          { to: `/signon${query}`, label: t("area.account.label") },
          { label: t("register.crumb") },
        ]}
      />
      <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.025em]">{t("register.title")}</h1>
      <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed">
        {t("register.lead")}
      </p>
      <div className="max-w-[480px]">
        {failed ? <Alert tone="error" title={t("register.error")} /> : null}
        <Panel className="mt-6">
          <form onSubmit={submit} noValidate className="contents">
            <Field label={t("field.userName")} hint={t("register.userName.hint")}>
              <input name="userName" autoComplete="username" className={inputClass} />
            </Field>
            <Field label={t("field.password")}>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>
            <Button type="submit" disabled={busy} className="mt-5 w-full">
              {busy ? t("register.submitting") : t("register.submit")}
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Button>
          </form>
        </Panel>
        <p className="mt-4 text-sm">
          <Link
            to={`/signon${query}`}
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {t("register.haveAccount")}
          </Link>
        </p>
      </div>
    </Page>
  );
}
