import { Link, useParams } from "react-router";

import { Crumbs, formatPrice, LoadState, Thumb } from "@/components/catalog";
import { getJson, type ItemWithProduct } from "@/components/catalog/api";
import { useLoad } from "@/hooks/use-load";
import { useScreen } from "@/i18n";

const link = "underline underline-offset-[3px]";

export default function ItemPage(): React.JSX.Element {
  const { id = "" } = useParams();
  const { t, locale } = useScreen();
  const {
    status,
    data: item,
    retry,
  } = useLoad(() => getJson<ItemWithProduct>(`/api/catalog/item/${encodeURIComponent(id)}`));
  const category = item?.categoryId ?? "";
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-[72px] sm:px-8">
      <div className="pt-6">
        <Crumbs
          trail={[
            { label: t("catalog.crumb"), to: "/catalog" },
            ...(item
              ? [
                  { label: category, to: `/category/${encodeURIComponent(category)}` },
                  { label: item.productName, to: `/product/${encodeURIComponent(item.productId)}` },
                  { label: item.description },
                ]
              : [{ label: id }]),
          ]}
        />
      </div>
      <LoadState status={status} empty={!item} retry={retry}>
        {item ? (
          <div className="grid gap-8 py-7 lg:grid-cols-2 lg:gap-14">
            <Thumb categoryId={category} className="aspect-[4/3] w-full" iconSize={96} />
            <div>
              <span className="text-muted-foreground border-border inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                {category} · {item.productName}
              </span>
              <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.025em]">
                {item.productName}
              </h1>
              <p className="text-muted-foreground mt-2 text-base leading-normal">
                {item.description}
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="border-border flex flex-col gap-1 rounded-[var(--radius)] border px-4 py-3.5">
                  <span className="text-muted-foreground text-[13px]">
                    {t("catalog.listPrice")}
                  </span>
                  <span data-testid="list-price" className="text-2xl tracking-[-0.02em]">
                    {formatPrice(item.listPrice, locale)}
                  </span>
                </div>
                <div className="border-border bg-muted flex flex-col gap-1 rounded-[var(--radius)] border px-4 py-3.5">
                  <span className="text-muted-foreground text-[13px]">
                    {t("catalog.memberPrice")}
                  </span>
                  <span data-testid="unit-cost" className="text-2xl tracking-[-0.02em]">
                    {formatPrice(item.unitCost, locale)}
                  </span>
                </div>
              </div>
              <hr className="border-border my-7" />
              <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5 text-sm">
                <dt className="text-muted-foreground">{t("catalog.item")}</dt>
                <dd>{item.id}</dd>
                <dt className="text-muted-foreground">{t("catalog.product")}</dt>
                <dd>
                  <Link to={`/product/${encodeURIComponent(item.productId)}`} className={link}>
                    {item.productName}
                  </Link>
                </dd>
                <dt className="text-muted-foreground">{t("catalog.category")}</dt>
                <dd>
                  <Link to={`/category/${encodeURIComponent(category)}`} className={link}>
                    {category}
                  </Link>
                </dd>
              </dl>
            </div>
          </div>
        ) : null}
      </LoadState>
    </div>
  );
}
