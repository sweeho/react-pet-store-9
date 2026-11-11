import { Link, useSearchParams } from "react-router";

import {
  CategoryBanner,
  Crumbs,
  LoadState,
  MyList,
  Pager,
  SearchForm,
  Thumb,
} from "@/components/catalog";
import { getJson, startOf, type Category, type Page } from "@/components/catalog/api";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

function Categories({ start }: { start: number }): React.JSX.Element {
  const { t } = useScreen();
  const { status, data, retry } = useLoad(() =>
    getJson<Page<Category>>(`/api/catalog/categories?start=${start}`),
  );
  const page = data;
  return (
    <LoadState status={status} empty={!page || page.rows.length === 0} retry={retry}>
      {page ? (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {page.rows.map((category) => (
              <Link
                key={category.id}
                to={`/category/${encodeURIComponent(category.id)}`}
                className="bg-card border-border hover:border-ring hover:bg-muted/50 flex items-center gap-6 rounded-[var(--radius)] border p-5 transition-colors"
              >
                <Thumb categoryId={category.id} className="h-[132px] w-[168px]" iconSize={64} />
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{category.name}</h2>
                  <span className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-medium">
                    {t("catalog.viewProducts")} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Pager
            caption="pager.categories"
            start={start}
            shown={page.rows.length}
            size={2}
            hasNext={page.hasNext}
            hasPrevious={page.hasPrevious}
          />
        </>
      ) : null}
    </LoadState>
  );
}

export default function CatalogPage(): React.JSX.Element {
  const { t } = useScreen();
  const [params] = useSearchParams();
  const start = startOf(params);
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-[72px] sm:px-8">
      <div className="flex flex-col gap-6 pt-8 pb-6 md:flex-row md:items-end">
        <div>
          <Crumbs trail={[{ label: t("catalog.crumb") }]} />
          <h1 className="mt-2.5 text-[30px] font-semibold tracking-[-0.025em]">
            {t("catalog.title")}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-[15px] leading-normal">
            {t("catalog.lead")}
          </p>
        </div>
        <SearchForm className="w-full md:ml-auto md:w-[340px]" />
      </div>
      <CategoryBanner />
      <div className="flex flex-col gap-8 lg:flex-row">
        <section className="min-w-0 flex-1">
          <Categories key={start} start={start} />
        </section>
        <MyList />
      </div>
    </div>
  );
}
