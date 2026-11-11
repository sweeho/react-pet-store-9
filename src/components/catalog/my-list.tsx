import { ListChecks } from "lucide-react";
import { Link } from "react-router";

import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

import { getJson, type Category, type Page, type Product } from "./api";
import { useCatalogSession } from "./use-catalog-session";

/** Products shown in MyList, independent of the list page size (design C3, C9). */
export const MYLIST_LIMIT = 10;

function Products({ categoryId }: { categoryId: string }): React.JSX.Element | null {
  const { t } = useScreen();
  const { data } = useLoad(() =>
    getJson<{ category: Category; products: Page<Product> }>(
      `/api/catalog/category/${encodeURIComponent(categoryId)}?start=0&count=${MYLIST_LIMIT}`,
    ),
  );
  if (!data) return null;
  return (
    <aside
      aria-label={t("mylist.title")}
      data-testid="mylist"
      className="border-border bg-muted/40 self-start rounded-[var(--radius)] border p-[18px] lg:sticky lg:top-[88px] lg:w-72 lg:flex-none"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <ListChecks aria-hidden="true" className="size-4" />
        {t("mylist.title")}
      </h3>
      <p className="text-muted-foreground mt-1 mb-3 text-[13px] leading-snug">
        {t("mylist.lead", { name: data.category.name })}
      </p>
      <ul>
        {data.products.rows.slice(0, MYLIST_LIMIT).map((product) => (
          <li key={product.id}>
            <Link
              to={`/product/${encodeURIComponent(product.id)}`}
              className="hover:bg-accent block rounded-md px-2.5 py-2 text-sm"
            >
              {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** The favourite-category sidebar; renders only when the session says MyList is on and names a category (design C9). */
export function MyList(): React.JSX.Element | null {
  const session = useCatalogSession();
  if (!session?.myList || !session.favoriteCategory) return null;
  return <Products categoryId={session.favoriteCategory} />;
}
