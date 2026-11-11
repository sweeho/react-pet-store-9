import { ChevronRight, CircleAlert } from "lucide-react";
import { Link } from "react-router";

import { useScreen } from "@/i18n";
import { cn } from "@/utils";

export const inputClass =
  "border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm font-normal focus-visible:ring-2 focus-visible:outline-none";

export function Crumbs({ trail }: { trail: { to?: string; label: string }[] }): React.JSX.Element {
  const { t } = useScreen();
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex items-center gap-1.5 pt-7 text-[13px]"
    >
      <Link to="/" className="hover:text-foreground">
        {t("nav.home")}
      </Link>
      {trail.map((c) => (
        <span key={c.label} className="flex items-center gap-1.5">
          <ChevronRight aria-hidden="true" className="size-3.5" />
          {c.to ? (
            <Link to={c.to} className="hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Page({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-8">{children}</div>;
}

export function Panel({
  className,
  ...props
}: React.ComponentProps<"div"> & { as?: never }): React.JSX.Element {
  return (
    <div className={cn("border-border rounded-[var(--radius)] border p-7", className)} {...props} />
  );
}

export function Field({
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: string;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={cn("mt-4 flex flex-col gap-1.5", className)}>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        <span>
          {label}
          {optional ? (
            <em className="text-muted-foreground ml-1 font-normal not-italic">{optional}</em>
          ) : null}
        </span>
        {children}
      </label>
      {error ? (
        <small className="text-destructive text-xs font-normal">{error}</small>
      ) : hint ? (
        <small className="text-muted-foreground text-xs font-normal">{hint}</small>
      ) : null}
    </div>
  );
}

export function Check({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.ComponentProps<"input">): React.JSX.Element {
  return (
    <label className="mt-4 flex cursor-pointer gap-2.5 text-sm">
      <input type="checkbox" className="accent-primary mt-0.5 size-4" {...props} />
      <span>
        {label}
        {hint ? <i className="text-muted-foreground block text-[13px] not-italic">{hint}</i> : null}
      </span>
    </label>
  );
}

export function Alert({
  title,
  children,
  tone = "muted",
}: {
  title: string;
  children?: React.ReactNode;
  tone?: "muted" | "error";
}): React.JSX.Element {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "mt-5 flex gap-3 rounded-[var(--radius)] border px-4 py-3.5 text-sm leading-normal",
        tone === "error"
          ? "text-destructive border-[color-mix(in_oklch,var(--destructive)_40%,white)] bg-[color-mix(in_oklch,var(--destructive)_5%,white)]"
          : "border-border bg-muted",
      )}
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-[18px] flex-none" />
      <div>
        <b className="block">{title}</b>
        {children ? (
          <p className={tone === "error" ? "text-foreground" : undefined}>{children}</p>
        ) : null}
      </div>
    </div>
  );
}
