import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { useScreen } from "@/i18n";

export interface Crumb {
  label: string;
  to?: string;
}

/** Breadcrumb trail starting at Home; the last crumb is the current page. */
export function Crumbs({ trail }: { trail: Crumb[] }): React.JSX.Element {
  const { t } = useScreen();
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]"
    >
      <Link to="/" className="hover:text-foreground">
        {t("nav.home")}
      </Link>
      {trail.map((crumb, index) => (
        <span key={`${index}-${crumb.label}`} className="flex items-center gap-1.5">
          <ChevronRight aria-hidden="true" className="size-3.5" />
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-foreground">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
