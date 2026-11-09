import { LoaderCircle } from "lucide-react";

interface LoadingFrameProps {
  label?: string;
}

export function LoadingFrame({ label = "Loading…" }: LoadingFrameProps) {
  return (
    <div
      data-testid="loading-frame"
      role="status"
      className="text-muted-foreground flex flex-col items-center gap-3 px-6 py-[72px] text-center text-[15px]"
    >
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
