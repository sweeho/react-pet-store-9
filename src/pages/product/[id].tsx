import { ArrowRight } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

import { Crumbs, formatPrice, LoadState, Pager, Thumb } from "@/components/catalog";
import { getJson, startOf, type Item, type Page, type Product } from "@/components/catalog/api";
import { Button } from "@/components/ui/button";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

interface Loaded {
  product: Product;
  items: Page<Item>;
}

function Items({ id, start }: { id: string; start: number }): React.JSX.Element {
  const { t, locale } = useScreen();
  const { status, data, retry } = useLoad(() =>
    getJson<Loaded>(`/api/catalog/product/${encodeURIComponent(id)}?start=${start}`),
  );
  const category = data?.product.categoryId ?? "";
  return (
    <>
      <div className="flex items-center gap-6 pt-8 pb-6">
        <Thumb categoryId={category} className="hidden h-24 w-[120px] sm:grid" />
        <div>
          <Crumbs
            trail={[
              { label: t("catalog.crumb"), to: "/catalog" },
              ...(data
                ? [
                    { label: category, to: `/category/${encodeURIComponent(category)}` },
                    { label: data.product.name },
                  ]
                : [{ label: id }]),
            ]}
          />
          <h1 className="mt-2.5 text-[30px] font-semibold tracking-[-0.025em]">
            {data?.product.name ?? id}
          </h1>
          {data?.product.description ? (
            <p className="text-muted-foreground mt-1.5 text-[15px]">{data.product.description}</p>
          ) : null}
        </div>
      </div>
      <LoadState status={status} empty={!data || data.items.rows.length === 0} retry={retry}>
        {data ? (
          <>
            <div className="border-border overflow-hidden rounded-[var(--radius)] border">
              {data.items.rows.map((item) => (
                <div
                  key={item.id}
                  data-testid="item-row"
                  className="border-border flex flex-wrap items-center gap-5 border-b p-4 last:border-b-0"
                >
                  <Thumb categoryId={category} className="h-16 w-[88px]" iconSize={28} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{item.description}</div>
                    <div className="text-muted-foreground mt-0.5 text-[13px]">
                      {t("catalog.item")} {item.id}
                    </div>
                  </div>
                  <div className="text-base">{formatPrice(item.listPrice, locale)}</div>
                  <Button asChild variant="outline">
                    <Link to={`/item/${encodeURIComponent(item.id)}`}>
                      {t("catalog.viewItem")}
                      <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <Pager
              caption="pager.items"
              start={start}
              shown={data.items.rows.length}
              size={2}
              hasNext={data.items.hasNext}
              hasPrevious={data.items.hasPrevious}
            />
          </>
        ) : null}
      </LoadState>
    </>
  );
}

export default function ProductPage(): React.JSX.Element {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const start = startOf(params);
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-[72px] sm:px-8">
      <Items key={`${id}:${start}`} id={id} start={start} />
    </div>
  );
}
