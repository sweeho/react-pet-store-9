import { ArrowRight } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

import { Crumbs, LoadState, MyList, Pager, Thumb } from "@/components/catalog";
import { getJson, startOf, type Category, type Page, type Product } from "@/components/catalog/api";
import { Button } from "@/components/ui/button";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

interface Loaded {
  category: Category;
  products: Page<Product>;
}

function Products({ id, start }: { id: string; start: number }): React.JSX.Element {
  const { t } = useScreen();
  const { status, data, retry } = useLoad(() =>
    getJson<Loaded>(`/api/catalog/category/${encodeURIComponent(id)}?start=${start}`),
  );
  const empty = !data || data.products.rows.length === 0;
  return (
    <>
      <div className="pt-8 pb-6">
        <Crumbs
          trail={[
            { label: t("catalog.crumb"), to: "/catalog" },
            { label: data?.category.name ?? id },
          ]}
        />
        <h1 className="mt-2.5 text-[30px] font-semibold tracking-[-0.025em]">
          {data?.category.name ?? id}
        </h1>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <section className="min-w-0 flex-1">
          <LoadState status={status} empty={empty} retry={retry}>
            {data ? (
              <>
                <div className="flex flex-col gap-4">
                  {data.products.rows.map((product) => (
                    <div
                      key={product.id}
                      data-testid="product-row"
                      className="bg-card border-border flex flex-wrap items-center gap-6 rounded-[var(--radius)] border p-4"
                    >
                      <Thumb categoryId={id} className="h-[104px] w-36" />
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold">{product.name}</h2>
                        {product.description ? (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {product.description}
                          </p>
                        ) : null}
                      </div>
                      <Button asChild variant="outline" className="ml-auto">
                        <Link to={`/product/${encodeURIComponent(product.id)}`}>
                          {t("catalog.seeItems")}
                          <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
                <Pager
                  caption="pager.products"
                  start={start}
                  shown={data.products.rows.length}
                  size={2}
                  hasNext={data.products.hasNext}
                  hasPrevious={data.products.hasPrevious}
                />
              </>
            ) : null}
          </LoadState>
        </section>
        <MyList />
      </div>
    </>
  );
}

export default function CategoryPage(): React.JSX.Element {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const start = startOf(params);
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-[72px] sm:px-8">
      <Products key={`${id}:${start}`} id={id} start={start} />
    </div>
  );
}
