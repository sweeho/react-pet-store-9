import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

import { ADMIN_LOGOUT_PATH, signOffAdmin } from "./api";

/** Ends the administration sign-on and shows the logged-out page. */
export function LogoutButton({ variant = "ghost" }: { variant?: "ghost" | "outline" }) {
  const { t } = useScreen();
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => void signOffAdmin().then(() => navigate(ADMIN_LOGOUT_PATH))}
    >
      <LogOut aria-hidden="true" className="mr-2 size-4" />
      {t("admin.logout")}
    </Button>
  );
}
