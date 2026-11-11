import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock,
  Globe,
  House,
  Mail,
  User,
  LayoutGrid,
} from "lucide-react";
import { Link } from "react-router";

import { EmptyFrame, ErrorFrame, LoadingFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useLoad } from "@/hooks/use-load";
import { type ScreenKey, useScreen } from "@/i18n";
import { cn } from "@/utils";

interface Locale {
  code: string;
}

/** The choices the Language page offers, in order (design L6). */
const CHOICES = ["en_US", "de_DE", "ja_JP", "zh_CN"] as const;

async function loadLocales(): Promise<Locale[]> {
  const response = await fetch("/api/locales");
  if (!response.ok) throw new Error(`GET /api/locales failed: ${response.status}`);
  return (await response.json()) as Locale[];
}

const Code = ({ children, ...rest }: React.ComponentProps<"code">) => (
  <code
    className="bg-muted border-border text-foreground rounded-[5px] border px-1.5 py-px font-mono text-xs"
    {...rest}
  >
    {children}
  </code>
);

function LocaleForm({ supported }: { supported: string[] }): React.JSX.Element {
  const { t, sessionLocale, setSessionLocale } = useScreen();
  const [chosen, setChosen] = useState<string>(sessionLocale);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [changed, setChanged] = useState<{ before: string; now: string } | null>(null);

  const nameOf = (code: string) =>
    CHOICES.includes(code as (typeof CHOICES)[number]) ? t(`locale.name.${code}`) : code;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Read the DOM value, not state: it is what the browser would submit.
    const code = String(new FormData(event.currentTarget).get("locale") ?? "");
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: code }),
      });
      if (!response.ok) throw new Error(`POST /api/locale failed: ${response.status}`);
      const { locale } = (await response.json()) as { locale: string };
      setChanged({ before: sessionLocale, now: locale });
      setSessionLocale(locale);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  const crumbs = (last: React.ReactNode) => (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex items-center gap-1.5 text-[13px]"
    >
      <Link to="/" className="hover:text-foreground">
        {t("nav.home")}
      </Link>
      <ChevronRight aria-hidden="true" className="size-3.5" />
      {last}
    </nav>
  );

  if (changed) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-7 pb-20 sm:px-8">
        {crumbs(
          <>
            <Link to="/locale" className="hover:text-foreground" onClick={() => setChanged(null)}>
              {t("language.current")}
            </Link>
            <ChevronRight aria-hidden="true" className="size-3.5" />
            <span className="text-foreground">{t("locale.done.crumb")}</span>
          </>,
        )}
        <div className="mx-auto mt-14 max-w-[660px]">
          <span className="grid size-12 place-items-center rounded-full bg-[color-mix(in_oklch,var(--chart-2)_14%,white)] text-[var(--chart-2)]">
            <Check aria-hidden="true" className="size-6" />
          </span>
          <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.025em]">
            {t("locale.done.title")}
          </h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            {t("locale.done.lead", { name: nameOf(changed.now) })}
          </p>
          <div className="border-border bg-muted mt-7 flex flex-wrap items-center gap-4 rounded-[var(--radius)] border p-5">
            <div className="text-muted-foreground">
              <div className="text-xs">{t("locale.done.before")}</div>
              <div className="mt-1 text-[15px]">
                {nameOf(changed.before)} <Code>{changed.before}</Code>
              </div>
            </div>
            <ArrowRight aria-hidden="true" className="text-muted-foreground size-[18px]" />
            <div>
              <div className="text-muted-foreground text-xs">{t("locale.done.now")}</div>
              <div className="mt-1 text-[15px] font-medium">
                {nameOf(changed.now)} <Code data-testid="session-locale">{changed.now}</Code>
              </div>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/">
                <House aria-hidden="true" className="mr-2 size-4" />
                {t("locale.done.home")}
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => setChanged(null)}>
              <Globe aria-hidden="true" className="mr-2 size-4" />
              {t("locale.done.another")}
            </Button>
          </div>
          <p className="text-muted-foreground mt-6 flex gap-2 text-xs leading-relaxed">
            {t("locale.done.hint")}
          </p>
        </div>
      </div>
    );
  }

  const notes: { icon: typeof Globe; key: ScreenKey }[] = [
    { icon: LayoutGrid, key: "locale.notes.catalog" },
    { icon: Clock, key: "locale.notes.timeout" },
    { icon: User, key: "locale.notes.profile" },
    { icon: Mail, key: "locale.notes.mail" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-7 pb-[72px] sm:px-8">
      {crumbs(<span className="text-foreground">{t("language.current")}</span>)}
      <div className="mt-5 grid items-start gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="max-w-[640px]">
          <h1 className="text-[32px] font-semibold tracking-[-0.025em]">{t("locale.title")}</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">{t("locale.lead")}</p>
          <p className="border-border text-muted-foreground mt-4 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-2.5 text-[13px]">
            <Globe aria-hidden="true" className="size-3.5" />
            {t("locale.current")}{" "}
            <b className="text-foreground font-medium">{nameOf(sessionLocale)}</b>{" "}
            <Code>{sessionLocale}</Code>
          </p>

          <form onSubmit={submit} noValidate className="mt-7">
            {failed ? (
              <div
                role="alert"
                className="text-destructive mb-4 flex gap-3 rounded-[var(--radius)] border border-[color-mix(in_oklch,var(--destructive)_35%,white)] bg-[color-mix(in_oklch,var(--destructive)_6%,white)] px-3.5 py-3 text-sm"
              >
                <CircleAlert aria-hidden="true" className="size-[18px] flex-none" />
                <div>
                  <b>{t("locale.error.title")}</b>
                  <p className="text-foreground mt-0.5 text-[13px]">
                    {t("locale.error.body", { current: nameOf(sessionLocale) })}
                  </p>
                </div>
              </div>
            ) : null}

            <label htmlFor="locale" className="mb-3 block text-sm font-semibold">
              {t("locale.label")}
            </label>
            <select
              id="locale"
              name="locale"
              key={sessionLocale}
              defaultValue={sessionLocale}
              onChange={(event) => setChosen(event.target.value)}
              className="border-input bg-card focus-visible:ring-ring h-12 w-full rounded-[var(--radius)] border px-4 text-[15px] font-medium focus-visible:ring-2 focus-visible:outline-none"
            >
              {CHOICES.map((code) => (
                <option key={code} value={code}>
                  {t(`locale.name.${code}`)} ({code})
                </option>
              ))}
            </select>
            <p className={cn("text-muted-foreground mt-2 min-h-5 text-[13px]")}>
              {t(`locale.english.${chosen}`) || null}
              {!supported.includes(chosen) ? ` · ${t("locale.noScreens")}` : null}
              {chosen === "en_US" ? <span> · {t("locale.default")}</span> : null}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? t("locale.submitting") : t("locale.submit")}
                <ArrowRight aria-hidden="true" className="ml-2 size-4" />
              </Button>
              <Button asChild variant="ghost">
                <Link to="/">{t("locale.cancel")}</Link>
              </Button>
            </div>
          </form>
        </div>

        <aside className="border-border bg-muted rounded-[var(--radius)] border p-5 lg:mt-2">
          <h2 className="text-sm font-semibold">{t("locale.notes.title")}</h2>
          <ul className="text-muted-foreground mt-3 flex flex-col gap-3 text-[13.5px] leading-normal">
            {notes.map(({ icon: Icon, key }) => (
              <li key={key} className="flex gap-2.5">
                <Icon aria-hidden="true" className="text-foreground mt-0.5 size-4 flex-none" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default function LocalePage(): React.JSX.Element {
  const { status, data, retry } = useLoad(loadLocales);
  const { t } = useScreen();

  if (status === "loading") return <LoadingFrame />;
  if (status === "error") return <ErrorFrame onRetry={retry} />;
  if (!data || data.length === 0) {
    return <EmptyFrame title={t("locale.empty.title")} message={t("locale.empty.message")} />;
  }
  return <LocaleForm supported={data.map((locale) => locale.code)} />;
}
