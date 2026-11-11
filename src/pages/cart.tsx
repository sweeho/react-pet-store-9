import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { Crumbs, formatPrice, Thumb } from "@/components/catalog";
import { fetchCart, removeFromCart, updateCart, type CartData } from "@/components/cart/api";
import { EmptyFrame, ErrorFrame, LoadingFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

// Money on the cart page is always US dollars, whatever the session locale (design K6, S3).
const usd = (amount: number): string => formatPrice(amount, "en_US");

export default function CartPage(): React.JSX.Element {
  const { t } = useScreen();
  const [cart, setCart] = useState<CartData | "error" | undefined>();
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    fetchCart().then(
      (data) => {
        setCart(data);
        setQuantities(Object.fromEntries(data.items.map((i) => [i.itemId, String(i.quantity)])));
      },
      () => setCart("error"),
    );
  }, []);
  useEffect(load, [load]);

  const act = (run: Promise<boolean>) => void run.then((ok) => (ok ? load() : setCart("error")));

  let body: React.JSX.Element;
  if (cart === undefined) {
    body = <LoadingFrame label={t("cart.loading")} />;
  } else if (cart === "error") {
    body = (
      <ErrorFrame title={t("cart.error.title")} message={t("cart.error.message")} onRetry={load} />
    );
  } else if (cart.items.length === 0) {
    body = (
      <EmptyFrame title={t("cart.empty.title")} message={t("cart.empty.message")}>
        <Button asChild>
          <Link to="/catalog">{t("cart.continue")}</Link>
        </Button>
      </EmptyFrame>
    );
  } else {
    body = (
      <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act(updateCart(quantities));
          }}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-muted-foreground border-border border-b text-left text-xs font-medium">
                <th className="px-4 pb-2.5">{t("cart.col.item")}</th>
                <th className="px-4 pb-2.5 text-right">{t("cart.col.price")}</th>
                <th className="px-4 pb-2.5 text-right">{t("cart.col.quantity")}</th>
                <th className="px-4 pb-2.5">
                  <span className="sr-only">{t("cart.remove")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((line) => (
                <tr key={line.itemId} className="border-border border-b">
                  <td className="p-4">
                    <div className="flex items-center gap-3.5">
                      <Thumb
                        categoryId={line.categoryId}
                        className="size-14 shrink-0"
                        iconSize={24}
                      />
                      <div>
                        <Link
                          to={`/item/${encodeURIComponent(line.itemId)}`}
                          className="font-semibold hover:underline"
                        >
                          {line.attribute}
                        </Link>
                        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-[13px]">
                          <span className="border-border rounded-full border px-2 text-[11px] font-medium">
                            {line.categoryId}
                          </span>
                          <span className="font-mono text-xs">{line.itemId}</span>
                          <span>·</span>
                          <span className="font-mono text-xs">{line.productId}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right tabular-nums">{usd(line.listPrice)}</td>
                  <td className="p-4 text-right">
                    <input
                      aria-label={`${t("cart.col.quantity")} ${line.itemId}`}
                      inputMode="numeric"
                      maxLength={10}
                      value={quantities[line.itemId] ?? ""}
                      onChange={(e) =>
                        setQuantities((q) => ({ ...q, [line.itemId]: e.target.value }))
                      }
                      className="border-input bg-background focus-visible:ring-ring h-9 w-[72px] rounded-md border px-2.5 text-right text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href="/cart"
                      onClick={(e) => {
                        e.preventDefault();
                        act(removeFromCart(line.itemId));
                      }}
                      className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                      {t("cart.remove")}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between gap-4">
            <Button asChild variant="outline">
              <Link to="/catalog">
                <ArrowLeft aria-hidden="true" className="mr-2 size-4" />
                {t("cart.continue")}
              </Link>
            </Button>
            <Button type="submit" variant="outline">
              {t("cart.update")}
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-[13px]">{t("cart.hint")}</p>
        </form>
        <aside className="border-border rounded-[var(--radius)] border p-5 lg:sticky lg:top-[88px]">
          <h2 className="text-[15px] font-semibold">{t("cart.summary")}</h2>
          <div className="mt-3 text-sm">
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">{t("cart.items")}</span>
              <span className="tabular-nums">{cart.items.length}</span>
            </div>
            <div className="border-border mt-1.5 flex justify-between border-t pt-3 font-semibold">
              <span>{t("cart.total")}</span>
              <span className="tabular-nums">{usd(cart.total)}</span>
            </div>
          </div>
          <Button asChild size="lg" className="mt-5 w-full">
            <Link to="/checkout">
              {t("cart.checkout")}
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </Button>
          <p className="text-muted-foreground mt-3 text-xs">{t("cart.signonNote")}</p>
        </aside>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-8">
      <div className="pt-7">
        <Crumbs trail={[{ label: t("cart.crumb") }]} />
      </div>
      <h1 className="mt-2.5 text-[30px] font-semibold tracking-[-0.025em]">{t("cart.title")}</h1>
      {cart && cart !== "error" && cart.items.length > 0 ? (
        <p className="text-muted-foreground mt-1.5 text-[15px]">
          {t("cart.lead", { count: String(cart.items.length) })}
        </p>
      ) : null}
      {body}
    </div>
  );
}
