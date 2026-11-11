import { ChevronDown, LogIn, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";

import { useScreen } from "@/i18n";

import { postJson, useAccountSession } from "./api";

const item =
  "hover:bg-accent flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium";

/** The header's account control (design A9): Sign in, or "Hi, <user name>" with My account and Sign off. */
export function AccountMenu(): React.JSX.Element | null {
  const { t } = useScreen();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = useAccountSession(pathname);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  if (!session) return null;

  if (!session.signedOn) {
    return (
      <Link
        to="/signon"
        className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
      >
        <LogIn aria-hidden="true" className="size-4" />
        {t("header.signIn")}
      </Link>
    );
  }

  const open = openedAt === pathname;
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpenedAt(open ? null : pathname)}
        className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
      >
        <User aria-hidden="true" className="size-4" />
        <span className="max-w-[5.5rem] truncate sm:max-w-none">
          {t("header.hi", { name: session.userName ?? "" })}
        </span>
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </button>
      {open ? (
        <div className="bg-background border-border absolute right-0 z-20 mt-1 w-48 rounded-md border p-1 shadow-md">
          <Link to="/account" className={item}>
            {t("header.myAccount")}
          </Link>
          <button
            type="button"
            className={item}
            onClick={() => {
              void postJson("/api/signoff", {}).then(() => {
                setOpenedAt(null);
                navigate("/");
              });
            }}
          >
            <LogOut aria-hidden="true" className="size-4" />
            {t("header.signOff")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
