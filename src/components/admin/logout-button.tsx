import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

import { INVENTORY_PATH, loginPath, signOffAdmin } from "./api";

/** Ends the administration sign-on and returns to the sign-in page. */
export function LogoutButton({ variant = "ghost" }: { variant?: "ghost" | "outline" }) {
  const { t } = useScreen();
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => void signOffAdmin().then(() => navigate(loginPath(INVENTORY_PATH)))}
    >
      <LogOut aria-hidden="true" className="mr-2 size-4" />
      {t("admin.logout")}
    </Button>
  );
}
