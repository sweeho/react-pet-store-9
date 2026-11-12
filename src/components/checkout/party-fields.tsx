import { useScreen } from "@/i18n";
import { cn } from "@/utils";

import { fieldId, type Field, type Party } from "./api";

type Layout = { field: Field; span: string; optional?: boolean; type?: string; auto: string };

// Column spans follow the mockup's six-column grid.
const LAYOUT: Layout[] = [
  { field: "firstName", span: "sm:col-span-3", auto: "given-name" },
  { field: "lastName", span: "sm:col-span-3", auto: "family-name" },
  { field: "address1", span: "sm:col-span-6", auto: "address-line1" },
  { field: "address2", span: "sm:col-span-6", optional: true, auto: "address-line2" },
  { field: "city", span: "sm:col-span-2", auto: "address-level2" },
  { field: "state", span: "sm:col-span-2", auto: "address-level1" },
  { field: "postalCode", span: "sm:col-span-2", auto: "postal-code" },
  { field: "phone", span: "sm:col-span-3", type: "tel", auto: "tel" },
  { field: "email", span: "sm:col-span-3", optional: true, type: "email", auto: "email" },
];

export function PartyFields({
  party,
  values,
  missing,
  onChange,
}: {
  party: "billing" | "shipping";
  values: Party;
  missing: ReadonlySet<string>;
  onChange: (field: Field, value: string) => void;
}): React.JSX.Element {
  const { t } = useScreen();
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 p-5 sm:grid-cols-6">
      {LAYOUT.map(({ field, span, optional, type, auto }) => {
        const bad = missing.has(`${party}.${field}`);
        const label = t(`checkout.field.${field}`);
        const id = fieldId(party, field);
        return (
          <div key={field} className={span}>
            <label htmlFor={id} className="mb-1.5 flex justify-between text-[13px] font-medium">
              {label}
              {optional ? (
                <span className="text-muted-foreground font-normal">{t("checkout.optional")}</span>
              ) : null}
            </label>
            <input
              id={id}
              name={`${party}.${field}`}
              type={type ?? "text"}
              autoComplete={auto}
              value={values[field]}
              aria-invalid={bad || undefined}
              onChange={(e) => onChange(field, e.target.value)}
              className={cn(
                "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none",
                bad &&
                  "border-destructive focus-visible:border-destructive ring-destructive/15 ring-[3px]",
              )}
            />
            {bad ? (
              <p className="text-destructive mt-1.5 text-xs">
                {t("checkout.required", { field: label })}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
