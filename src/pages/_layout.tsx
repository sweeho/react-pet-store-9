import { Dialog, DialogPanel } from "@headlessui/react";
import {
  Globe,
  House,
  LayoutGrid,
  Menu,
  PawPrint,
  Shield,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";

import { AccountMenu } from "@/components/account/account-menu";
import { RequireSignOn } from "@/components/account/require-sign-on";
import { CartBadge } from "@/components/cart";
import { PRIMARY_AREAS } from "@/constants/primary-areas";
import { useScreen } from "@/i18n";
import { cn } from "@/utils";

const AREA_ICONS = {
  catalog: LayoutGrid,
  localization: Globe,
  account: User,
  cart: ShoppingCart,
  administration: Shield,
} as const;

function Brand() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 text-base font-semibold tracking-tight whitespace-nowrap"
    >
      <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-md">
        <PawPrint aria-hidden="true" className="size-[18px]" />
      </span>
      Pet Store
    </Link>
  );
}

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
    "hover:bg-accent hover:text-foreground",
    isActive ? "bg-secondary text-foreground" : "text-muted-foreground",
  );

const drawerLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex h-11 items-center gap-3 rounded-md px-3 text-base font-medium",
    "hover:bg-accent hover:text-foreground",
    isActive ? "bg-secondary text-foreground" : "text-muted-foreground",
  );

export default function SiteLayout(): React.JSX.Element {
  const { t, locale } = useScreen();
  const { pathname } = useLocation();
  // The menu is open for the path it was opened on, so navigating closes it.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt === pathname;
  const setMenuOpen = (open: boolean) => setOpenedAt(open ? pathname : null);

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <header className="bg-background border-border sticky top-0 z-10 border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-8 px-4 sm:px-8">
          <Brand />
          <nav aria-label={t("nav.global")} className="hidden flex-1 gap-1 lg:flex">
            <NavLink to="/" end className={desktopLink}>
              <House aria-hidden="true" className="size-4" />
              {t("nav.home")}
            </NavLink>
            {PRIMARY_AREAS.map((area) => {
              const Icon = AREA_ICONS[area.slug as keyof typeof AREA_ICONS];
              return (
                <NavLink key={area.slug} to={area.href} className={desktopLink}>
                  {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
                  {t(`area.${area.slug}.label`) || area.label}
                  {area.slug === "cart" ? <CartBadge pathname={pathname} /> : null}
                </NavLink>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Link
              to="/locale"
              className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
            >
              <Globe aria-hidden="true" className="size-4" />
              <span className="sr-only">{t("language.current")}: </span>
              {locale}
            </Link>
            <AccountMenu />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="hover:bg-accent inline-flex size-10 items-center justify-center rounded-md lg:hidden"
            >
              <span className="sr-only">{t("menu.open")}</span>
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
        <Dialog open={menuOpen} onClose={setMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" />
          <DialogPanel className="bg-background fixed inset-y-0 right-0 z-50 w-full overflow-y-auto p-4 sm:max-w-sm sm:border-l">
            <div className="flex h-16 items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="hover:bg-accent inline-flex size-10 items-center justify-center rounded-md"
              >
                <span className="sr-only">{t("menu.close")}</span>
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1">
              <NavLink to="/" end className={drawerLink}>
                <House aria-hidden="true" className="size-5" />
                {t("nav.home")}
              </NavLink>
              {PRIMARY_AREAS.map((area) => {
                const Icon = AREA_ICONS[area.slug as keyof typeof AREA_ICONS];
                return (
                  <NavLink key={area.slug} to={area.href} className={drawerLink}>
                    {Icon ? <Icon aria-hidden="true" className="size-5" /> : null}
                    {t(`area.${area.slug}.label`) || area.label}
                    {area.slug === "cart" ? <CartBadge pathname={pathname} /> : null}
                  </NavLink>
                );
              })}
            </nav>
          </DialogPanel>
        </Dialog>
      </header>

      <main className="flex-1">
        <RequireSignOn>
          <Outlet />
        </RequireSignOn>
      </main>

      <footer className="border-border bg-muted border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-8 px-4 py-8 sm:flex-row sm:px-8">
          <div>
            <Brand />
            <p className="text-muted-foreground mt-2.5 max-w-[300px] text-[13px] leading-normal">
              {t("brand.tagline")}
              <br />© 2026 Pet Store
            </p>
          </div>
          <div className="text-sm">
            <h4 className="mb-3 text-[13px] font-semibold">{t("nav.explore")}</h4>
            <ul>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground block py-0.5">
                  {t("nav.home")}
                </Link>
              </li>
              {PRIMARY_AREAS.map((area) => (
                <li key={area.slug}>
                  <Link
                    to={area.href}
                    className="text-muted-foreground hover:text-foreground block py-0.5"
                  >
                    {t(`area.${area.slug}.label`) || area.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/locale"
                  className="text-muted-foreground hover:text-foreground block py-0.5"
                >
                  {t("footer.changeLanguage")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
