import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

export interface PagerProps {
  /** Dictionary key of the "from–to" caption, e.g. `pager.products`. */
  caption: string;
  start: number;
  shown: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Previous / Next as links carrying `?start=`, so a page is a URL (design C3). */
export function Pager({
  caption,
  start,
  shown,
  size,
  hasNext,
  hasPrevious,
}: PagerProps): React.JSX.Element {
  const { t } = useScreen();
  const [params] = useSearchParams();
  // Keep the other parameters (the search query) and replace only `start`.
  const to = (offset: number) => {
    const next = new URLSearchParams(params);
    next.set("start", String(offset));
    return `?${next.toString()}`;
  };
  return (
    <div className="border-border mt-6 flex items-center gap-2 border-t pt-5">
      <span className="text-muted-foreground mr-auto text-[13px]">
        {t(caption, { from: String(start + 1), to: String(start + shown) })}
      </span>
      {hasPrevious ? (
        <Button asChild variant="outline">
          <Link to={to(Math.max(0, start - size))}>
            <ChevronLeft aria-hidden="true" className="mr-1 size-4" />
            {t("pager.previous")}
          </Link>
        </Button>
      ) : null}
      {hasNext ? (
        <Button asChild variant="outline">
          <Link to={to(start + size)}>
            {t("pager.next")}
            <ChevronRight aria-hidden="true" className="ml-1 size-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
