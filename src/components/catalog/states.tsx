import { Link } from "react-router";

import { EmptyFrame, ErrorFrame, LoadingFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/i18n";

/** The shared loading / error / empty frames with catalog wording; ready content is passed as `children`. */
export function LoadState({
  status,
  empty,
  retry,
  emptyTitle,
  emptyMessage,
  children,
}: {
  status: "loading" | "ready" | "error";
  empty: boolean;
  retry: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const { t } = useScreen();
  if (status === "loading") return <LoadingFrame label={t("catalog.loading")} />;
  if (status === "error") {
    return (
      <ErrorFrame
        title={t("catalog.error.title")}
        message={t("catalog.error.message")}
        onRetry={retry}
      />
    );
  }
  if (empty) {
    return (
      <EmptyFrame
        title={emptyTitle ?? t("catalog.empty.title")}
        message={emptyMessage ?? t("catalog.empty.message")}
      >
        <Button asChild variant="outline">
          <Link to="/catalog">{t("catalog.empty.back")}</Link>
        </Button>
      </EmptyFrame>
    );
  }
  return <>{children}</>;
}
