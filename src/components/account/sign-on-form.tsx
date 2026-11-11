import { Lock } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

import { postJson, safeNext, useAccountSession } from "./api";
import { Check, Field, inputClass, Panel } from "./ui";

/** The returning-customer panel (design A9): posts the sign-on and follows `next`, or goes to the error page. */
export function SignOnForm({
  next,
  userName,
}: {
  next: string | null;
  userName?: string;
}): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const remembered = useAccountSession("signon")?.rememberedUserName;
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    void postJson("/api/signon", {
      userName: String(data.get("userName") ?? ""),
      password: String(data.get("password") ?? ""),
      remember: data.get("remember") === "on",
    })
      .then((res) => navigate(res.ok ? safeNext(next) : `/signon/error${nextQuery}`))
      .catch(() => navigate(`/signon/error${nextQuery}`))
      .finally(() => setBusy(false));
  }

  return (
    <Panel>
      <form onSubmit={submit} className="contents">
        <h2 className="text-lg font-semibold">{t("signon.returning.title")}</h2>
        <p className="text-muted-foreground my-1 text-sm leading-normal">
          {t("signon.returning.hint")}
        </p>
        <Field label={t("field.userName")}>
          <input
            key={remembered ?? userName ?? ""}
            name="userName"
            autoComplete="username"
            defaultValue={userName ?? remembered ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label={t("field.password")}>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
          />
        </Field>
        <Check
          name="remember"
          label={t("signon.remember")}
          hint={t("signon.remember.hint")}
          key={remembered ? "r" : "n"}
          defaultChecked={remembered !== undefined}
        />
        <Button type="submit" disabled={busy} className="mt-5 w-full">
          <Lock aria-hidden="true" className="mr-2 size-4" />
          {busy ? t("signon.submitting") : t("signon.submit")}
        </Button>
      </form>
    </Panel>
  );
}

export function NewCustomerPanel({
  next,
  muted,
}: {
  next: string | null;
  muted?: boolean;
}): React.JSX.Element {
  const { t } = useScreen();
  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <Panel className={muted ? "bg-muted" : undefined}>
      <h2 className="text-lg font-semibold">{t("signon.new.title")}</h2>
      <p className="text-muted-foreground my-1 text-sm leading-normal">{t("signon.new.hint")}</p>
      <Button asChild variant="outline" className="mt-5 w-full">
        <Link reloadDocument to={`/register${query}`}>
          {t("signon.new.link")}
        </Link>
      </Button>
    </Panel>
  );
}
