import { Search } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";
import { cn } from "@/utils";

/** The catalog search box; submitting goes to `/search?q=`. `withButton` adds the submit button (search page). */
export function SearchForm({
  initial = "",
  withButton = false,
  className,
}: {
  initial?: string;
  withButton?: boolean;
  className?: string;
}): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  return (
    <form
      role="search"
      className={cn("flex gap-3", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "");
        void navigate(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <div className="relative flex-1">
        <Search aria-hidden="true" className="text-muted-foreground absolute top-3 left-3 size-4" />
        <input
          name="q"
          type="search"
          defaultValue={initial}
          aria-label={t("catalog.search.label")}
          placeholder={t("catalog.search.placeholder")}
          className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>
      {withButton ? <Button type="submit">{t("catalog.search.submit")}</Button> : null}
    </form>
  );
}
