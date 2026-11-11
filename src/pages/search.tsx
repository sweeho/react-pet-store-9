import { ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Crumbs, formatPrice, LoadState, Pager, SearchForm, Thumb } from "@/components/catalog";
import { getJson, startOf, type ItemWithProduct, type Page } from "@/components/catalog/api";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

function Results({ q, start }: { q: string; start: number }): React.JSX.Element {
  const { t, locale } = useScreen();
  const blank = q.trim() === "";
  const { status, data, retry } = useLoad(() =>
    blank
      ? Promise.resolve<Page<ItemWithProduct>>({ rows: [], hasNext: false, hasPrevious: false })
      : getJson<Page<ItemWithProduct>>(
          `/api/catalog/search?q=${encodeURIComponent(q)}&start=${start}`,
        ),
  );
  return (
    <>
      {blank ? null : (
        <p className="text-muted-foreground mt-2 mb-4 text-sm">{t("search.meta", { q })}</p>
      )}
      <LoadState
        status={status}
        empty={!data || data.rows.length === 0}
        retry={retry}
        emptyTitle={t("search.empty.title")}
        emptyMessage={blank ? t("search.blank") : t("search.empty.message", { q })}
      >
        {data ? (
          <>
            <div className="flex flex-col gap-3">
              {data.rows.map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${encodeURIComponent(item.id)}`}
                  data-testid="result-row"
                  className="bg-card border-border hover:border-ring hover:bg-muted/50 flex items-center gap-5 rounded-[var(--radius)] border px-4 py-3.5 transition-colors"
                >
                  <Thumb
                    categoryId={item.categoryId ?? ""}
                    className="h-[72px] w-24"
                    iconSize={32}
                  />
                  <div className="min-w-0">
                    <div className="text-base font-semibold">{item.description}</div>
                    <div className="text-muted-foreground mt-1 text-[13px]">{item.productName}</div>
                  </div>
                  <span className="ml-auto text-base">{formatPrice(item.listPrice, locale)}</span>
                  <ChevronRight aria-hidden="true" className="text-muted-foreground size-4" />
                </Link>
              ))}
            </div>
            <Pager
              caption="pager.results"
              start={start}
              shown={data.rows.length}
              size={2}
              hasNext={data.hasNext}
              hasPrevious={data.hasPrevious}
            />
          </>
        ) : null}
      </LoadState>
    </>
  );
}

export default function SearchPage(): React.JSX.Element {
  const { t } = useScreen();
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const start = startOf(params);
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-[72px] sm:px-8">
      <div className="pt-8 pb-6">
        <Crumbs trail={[{ label: t("search.title") }]} />
        <h1 className="mt-2.5 text-[30px] font-semibold tracking-[-0.025em]">
          {t("search.title")}
        </h1>
        <SearchForm key={q} initial={q} withButton className="mt-5 max-w-[640px]" />
      </div>
      <Results key={`${q}:${start}`} q={q} start={start} />
    </div>
  );
}
