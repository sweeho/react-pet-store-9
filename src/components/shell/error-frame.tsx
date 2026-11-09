import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorFrameProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export function ErrorFrame({
  title = "Something went wrong",
  message = "We couldn't load this page. Check your connection and try again.",
  onRetry,
}: ErrorFrameProps) {
  return (
    <div
      data-testid="error-frame"
      role="alert"
      className="flex flex-col items-center px-6 py-[72px] text-center"
    >
      <div className="text-destructive mb-5 grid size-14 place-items-center rounded-full bg-[color-mix(in_oklch,var(--destructive)_10%,white)]">
        <TriangleAlert aria-hidden="true" className="size-6" strokeWidth={1.75} />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-[420px] text-[15px] leading-relaxed">
        {message}
      </p>
      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={onRetry}>
          <RotateCw aria-hidden="true" className="mr-2 size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
