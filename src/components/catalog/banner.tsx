import { useScreen } from "@/i18n";

import { Thumb } from "./thumb";
import { useCatalogSession } from "./use-catalog-session";

const FALLBACK = "DOGS";
const titleCase = (id: string) => id.charAt(0) + id.slice(1).toLowerCase();

/** The category banner: the shopper's favourite category, or dogs when there is none (design C10). */
export function CategoryBanner(): React.JSX.Element | null {
  const { t } = useScreen();
  const session = useCatalogSession();
  if (session?.banner === false) return null;
  const id = session?.bannerCategory ?? session?.favoriteCategory ?? FALLBACK;
  return (
    <div
      data-testid="category-banner"
      data-category={id}
      className="border-border bg-muted/40 mb-6 flex items-center gap-4 rounded-[var(--radius)] border p-3"
    >
      <Thumb categoryId={id} className="size-12" iconSize={26} />
      <div>
        <div className="text-muted-foreground text-xs">{t("catalog.banner")}</div>
        <div className="text-[15px] font-semibold">{titleCase(id)}</div>
      </div>
    </div>
  );
}
