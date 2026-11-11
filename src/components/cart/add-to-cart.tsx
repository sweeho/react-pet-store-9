import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

import { addToCart } from "./api";

/** A quantity field and the Add to cart button of the item page; adding opens the cart. */
export function AddToCart({ itemId }: { itemId: string }): React.JSX.Element {
  const { t } = useScreen();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState("1");
  const [failed, setFailed] = useState(false);
  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void addToCart(itemId, Number.parseInt(quantity, 10) || 1).then((ok) => {
          setFailed(!ok);
          if (ok) void navigate("/cart");
        });
      }}
    >
      <label className="flex flex-col gap-1 text-[13px]">
        <span className="text-muted-foreground">{t("cart.quantity")}</span>
        <input
          inputMode="numeric"
          maxLength={10}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border-input bg-background focus-visible:ring-ring h-10 w-20 rounded-md border px-3 text-right text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>
      <Button type="submit">{t("cart.add")}</Button>
      {failed ? (
        <p role="alert" className="text-destructive text-sm">
          {t("cart.error.message")}
        </p>
      ) : null}
    </form>
  );
}
