import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CreditCard,
  Info,
  Receipt,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Link } from "react-router";

import { Crumbs, Page } from "@/components/account/ui";
import { fetchCart, type CartData } from "@/components/cart/api";
import { Thumb, formatPrice } from "@/components/catalog";
import {
  emptyParty,
  FIELDS,
  fetchProfile,
  fieldId,
  PartyFields,
  submitOrder,
  type Field,
  type Party,
} from "@/components/checkout";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

// Money on the checkout page is always US dollars, like the cart page (design O10).
const usd = (amount: number): string => formatPrice(amount, "en_US");

// The fixed card every order carries (R-0098), shown read-only.
const CARD = { type: "Duke Express", number: "1234-2334", expiry: "10/2001" };

function PanelHead({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof Receipt;
  title: string;
  hint: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="border-border flex items-center gap-3 border-b px-5 py-4">
      <span className="bg-secondary grid size-8 place-items-center rounded-md">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-px text-[13px]">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export default function CheckoutPage(): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Party>(emptyParty);
  const [shipping, setShipping] = useState<Party>(emptyParty);
  const [cart, setCart] = useState<CartData | undefined>();
  const [missing, setMissing] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchProfile().then((profile) => {
      if (cancelled) return;
      // Keep anything the shopper already typed while the profile was loading.
      const untouched = (p: Party) => FIELDS.every((f) => p[f] === "");
      setBilling((p) => (untouched(p) ? profile : p));
      setShipping((p) => (untouched(p) ? profile : p));
    });
    void fetchCart().then(
      (data) => !cancelled && setCart(data),
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const edit =
    (set: React.Dispatch<React.SetStateAction<Party>>, party: "billing" | "shipping") =>
    (field: Field, value: string) => {
      set((p) => ({ ...p, [field]: value }));
      setMissing((m) => m.filter((k) => k !== `${party}.${field}`));
    };

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const result = await submitOrder(billing, shipping);
    setBusy(false);
    if (result.kind === "placed") {
      void navigate("/checkout/confirmation", {
        state: { orderNumber: result.orderNumber, email: result.email },
      });
    } else if (result.kind === "empty") {
      void navigate("/checkout/error");
    } else if (result.kind === "missing") {
      setMissing(result.missing);
      queueMicrotask(() => summaryRef.current?.focus());
    } else {
      setFailed(true);
    }
  };

  const missingSet = new Set(missing);
  const items = cart?.items ?? [];

  return (
    <Page>
      <Crumbs trail={[{ label: t("cart.crumb"), to: "/cart" }, { label: t("checkout.crumb") }]} />
      <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.025em]">{t("checkout.title")}</h1>
      <p className="text-muted-foreground mt-1.5 text-[15px] leading-normal">
        {t("checkout.lead")}
      </p>

      {missing.length > 0 || failed ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="border-destructive/40 bg-destructive/5 text-destructive mt-6 flex gap-3 rounded-[var(--radius)] border p-4"
        >
          <CircleAlert aria-hidden="true" className="mt-px size-[18px] shrink-0" />
          <div>
            <h3 className="text-sm font-semibold">
              {failed
                ? t("checkout.failed")
                : t("checkout.missing.title", { count: String(missing.length) })}
            </h3>
            {missing.length > 0 ? (
              <ul className="mt-1.5 list-disc pl-5 text-[13px]">
                {missing.map((key) => {
                  const [party, field] = key.split(".") as ["billing" | "shipping", Field];
                  return (
                    <li key={key}>
                      <a href={`#${fieldId(party, field)}`} className="underline">
                        {t(`checkout.missing.${party}`, {
                          field: t(`checkout.field.${field}`).toLowerCase(),
                        })}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <form
        noValidate
        onSubmit={(e) => void place(e)}
        className="mt-7 grid items-start gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="grid gap-5">
          <section className="border-border rounded-[var(--radius)] border">
            <PanelHead
              icon={Receipt}
              title={t("checkout.billing.title")}
              hint={t("checkout.billing.hint")}
            />
            <PartyFields
              party="billing"
              values={billing}
              missing={missingSet}
              onChange={edit(setBilling, "billing")}
            />
          </section>
          <section className="border-border rounded-[var(--radius)] border">
            <PanelHead
              icon={Truck}
              title={t("checkout.shipping.title")}
              hint={t("checkout.shipping.hint")}
            />
            <PartyFields
              party="shipping"
              values={shipping}
              missing={missingSet}
              onChange={edit(setShipping, "shipping")}
            />
          </section>
          <section className="border-border rounded-[var(--radius)] border">
            <PanelHead
              icon={CreditCard}
              title={t("checkout.payment.title")}
              hint={t("checkout.payment.hint")}
            />
            <div className="flex items-center gap-3.5 px-5 py-4">
              <span className="bg-primary text-primary-foreground grid h-9 w-[52px] place-items-center rounded-md text-[10px] font-semibold tracking-[0.04em]">
                DUKE
              </span>
              <div>
                <div className="text-sm font-medium">
                  {CARD.type} ···· {CARD.number.slice(-4)}
                </div>
                <div className="text-muted-foreground mt-0.5 text-[13px]">
                  {t("checkout.payment.expires", { number: CARD.number, expiry: CARD.expiry })}
                </div>
              </div>
            </div>
            <div className="border-border bg-muted/60 text-muted-foreground flex gap-2 rounded-b-[var(--radius)] border-t px-5 py-3 text-xs leading-normal">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>{t("checkout.payment.note")}</span>
            </div>
          </section>
          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="outline">
              <Link to="/cart">
                <ArrowLeft aria-hidden="true" className="mr-2 size-4" />
                {t("checkout.back")}
              </Link>
            </Button>
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? t("checkout.placing") : t("checkout.place")}
              {!busy && cart && items.length > 0 ? ` · ${usd(cart.total)}` : null}
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Button>
          </div>
        </div>

        <aside className="border-border rounded-[var(--radius)] border lg:sticky lg:top-[88px]">
          <PanelHead
            icon={ShoppingCart}
            title={t("checkout.summary.title")}
            hint={t("checkout.summary.items", {
              count: String(items.reduce((n, l) => n + l.quantity, 0)),
            })}
          >
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link to="/cart">{t("checkout.summary.edit")}</Link>
            </Button>
          </PanelHead>
          {items.length === 0 ? (
            <p className="text-muted-foreground border-border border-b px-5 py-4 text-[13px]">
              {t("checkout.summary.empty")}
            </p>
          ) : (
            items.map((line) => (
              <div key={line.itemId} className="border-border flex gap-3 border-b px-5 py-3.5">
                <Thumb categoryId={line.categoryId} className="size-11 shrink-0" iconSize={20} />
                <div>
                  <div className="text-sm font-medium">{line.attribute}</div>
                  <div className="text-muted-foreground mt-0.5 text-xs">
                    {line.categoryId} · {line.productName} · {line.itemId}
                  </div>
                </div>
                <div className="ml-auto text-right text-sm whitespace-nowrap tabular-nums">
                  {usd(line.lineTotal)}
                  <span className="text-muted-foreground block text-xs">
                    {line.quantity} × {usd(line.listPrice)}
                  </span>
                </div>
              </div>
            ))
          )}
          <div className="flex items-baseline justify-between px-5 py-4">
            <span className="text-muted-foreground text-sm">{t("checkout.summary.total")}</span>
            <b className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums">
              {usd(cart?.total ?? 0)}
            </b>
          </div>
        </aside>
      </form>
    </Page>
  );
}
