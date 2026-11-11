import { useCartCount } from "./api";

/** The count of cart lines beside the nav's Cart entry; hidden while the cart is empty. */
export function CartBadge({ pathname }: { pathname: string }): React.JSX.Element | null {
  const count = useCartCount(pathname);
  if (count <= 0) return null;
  return (
    <span
      data-testid="cart-badge"
      className="bg-primary text-primary-foreground inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-[5px] text-[11px] font-semibold"
    >
      {count}
    </span>
  );
}
