import { Clock } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

import { postJson, safeNext } from "./api";
import { EMPTY_CUSTOMER, type CustomerValues } from "./customer-values";
import { Alert, Check, Field, inputClass } from "./ui";

const REQUIRED = [
  "firstName",
  "lastName",
  "phone",
  "address1",
  "city",
  "state",
  "postalCode",
] as const;
const COUNTRIES = ["USA", "Japan", "China"];
const CARD_TYPES = ["Visa", "MasterCard", "American Express"];
const LANGUAGES = ["en_US", "ja_JP", "zh_CN"];
const CATEGORIES = ["DOGS", "CATS", "REPTILES", "BIRDS", "FISH"];
const titleCase = (id: string) => id.charAt(0) + id.slice(1).toLowerCase();

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border grid gap-4 border-b py-6 md:grid-cols-[240px_1fr] md:gap-8">
      <div>
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {hint ? (
          <p className="text-muted-foreground mt-1 text-[13px] leading-normal">{hint}</p>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

const Row = ({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) => (
  <div className={cols === 2 ? "grid gap-x-4 sm:grid-cols-2" : "grid gap-x-4 sm:grid-cols-3"}>
    {children}
  </div>
);

/**
 * The customer form (design A9): step 2 of registration (`mode="new"`, POST) and the My Account
 * profile (`mode="edit"`, PUT). Unchecked boxes are sent as false.
 */
export function CustomerForm({
  mode,
  initial,
  next,
}: {
  mode: "new" | "edit";
  initial: CustomerValues;
  next?: string | null;
}): React.JSX.Element {
  const { t, setSessionLocale } = useScreen();
  const navigate = useNavigate();
  const [missing, setMissing] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "busy" | "saved" | "failed">("idle");
  const [formKey, setFormKey] = useState(0);

  const err = (name: string) => (missing.includes(name) ? t(`customer.${name}.error`) : undefined);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (k: string) => String(data.get(k) ?? "").trim();
    const absent = REQUIRED.filter((k) => text(k) === "");
    setMissing(absent);
    if (absent.length > 0) return;
    const body = {
      ...Object.fromEntries(Object.keys(EMPTY_CUSTOMER).map((k) => [k, text(k)])),
      myList: data.get("myList") === "on",
      banner: data.get("banner") === "on",
    };
    setStatus("busy");
    void postJson("/api/customer", body, mode === "new" ? "POST" : "PUT")
      .then(async (res) => {
        if (!res.ok) return setStatus("failed");
        const { locale } = (await res.json()) as { locale?: string };
        if (locale) setSessionLocale(locale);
        if (mode === "new") navigate(safeNext(next));
        else setStatus("saved");
      })
      .catch(() => setStatus("failed"));
  }

  const v = initial;
  const optional = t("customer.optional");
  const input = (name: keyof CustomerValues, props: React.ComponentProps<"input"> = {}) => (
    <input name={name} defaultValue={String(v[name])} className={inputClass} {...props} />
  );
  const select = (name: keyof CustomerValues, options: [string, string][]) => (
    <select name={name} defaultValue={String(v[name])} className={inputClass}>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  return (
    <form key={formKey} onSubmit={submit} noValidate className="mt-4">
      {missing.length > 0 ? (
        <Alert tone="error" title={t("customer.missing.title")}>
          {t("customer.missing.body", {
            fields: missing.map((k) => t(`customer.${k}`)).join(", "),
          })}
        </Alert>
      ) : null}
      {status === "failed" ? <Alert tone="error" title={t("customer.saveError")} /> : null}
      {status === "saved" ? (
        <div
          role="status"
          className="bg-muted border-border mt-5 rounded-[var(--radius)] border px-4 py-3 text-sm"
        >
          {t("customer.saved")}
        </div>
      ) : null}

      <Section title={t("customer.contact")} hint={t("customer.contact.hint")}>
        <Row cols={2}>
          <Field label={t("customer.firstName")} error={err("firstName")}>
            {input("firstName")}
          </Field>
          <Field label={t("customer.lastName")} error={err("lastName")}>
            {input("lastName")}
          </Field>
        </Row>
        <Row cols={2}>
          <Field label={t("customer.phone")} error={err("phone")}>
            {input("phone", { type: "tel" })}
          </Field>
          <Field label={t("customer.email")} optional={optional}>
            {input("email", { type: "email" })}
          </Field>
        </Row>
      </Section>

      <Section title={t("customer.address")}>
        <Field label={t("customer.address1")} error={err("address1")}>
          {input("address1")}
        </Field>
        <Field label={t("customer.address2")} optional={optional}>
          {input("address2")}
        </Field>
        <Row cols={2}>
          <Field label={t("customer.city")} error={err("city")}>
            {input("city")}
          </Field>
          <Field label={t("customer.state")} error={err("state")}>
            {input("state")}
          </Field>
        </Row>
        <Row cols={2}>
          <Field label={t("customer.postalCode")} error={err("postalCode")}>
            {input("postalCode")}
          </Field>
          <Field label={t("customer.country")}>
            {select(
              "country",
              COUNTRIES.map((c) => [c, t(`customer.country.${c}`)]),
            )}
          </Field>
        </Row>
      </Section>

      <Section title={t("customer.card")} hint={t("customer.card.hint")}>
        <Row cols={3}>
          <Field label={t("customer.cardType")}>
            {select(
              "cardType",
              CARD_TYPES.map((c) => [c, c]),
            )}
          </Field>
          <Field label={t("customer.cardNumber")}>
            {input("cardNumber", { inputMode: "numeric" })}
          </Field>
          <Field label={t("customer.cardExpiry")}>
            {input("cardExpiry", { placeholder: "MM/YYYY" })}
          </Field>
        </Row>
      </Section>

      <Section title={t("customer.prefs")} hint={t("customer.prefs.hint")}>
        <Row cols={2}>
          <Field label={t("customer.language")}>
            {select(
              "language",
              LANGUAGES.map((l) => [l, t(`locale.name.${l}`)]),
            )}
          </Field>
          <Field label={t("customer.favoriteCategory")} optional={optional}>
            {select("favoriteCategory", [
              ["", t("customer.noFavourite")],
              ...CATEGORIES.map((c): [string, string] => [c, titleCase(c)]),
            ])}
          </Field>
        </Row>
        <Check
          name="myList"
          label={t("customer.myList")}
          hint={t("customer.myList.hint")}
          defaultChecked={v.myList}
        />
        <Check
          name="banner"
          label={t("customer.banner")}
          hint={t("customer.banner.hint")}
          defaultChecked={v.banner}
        />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        {mode === "edit" ? (
          <span className="text-muted-foreground flex items-center gap-2 text-[13px]">
            <Clock aria-hidden="true" className="size-3.5" />
            {t("customer.idle")}
          </span>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMissing([]);
                setStatus("idle");
                setFormKey((k) => k + 1);
              }}
            >
              {t("customer.discard")}
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/signon">{t("customer.cancel")}</Link>
            </Button>
          )}
          <Button type="submit" disabled={status === "busy"}>
            {mode === "new" ? t("customer.create") : t("customer.save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
