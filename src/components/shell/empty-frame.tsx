import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyFrameProps {
  title?: string;
  message?: string;
  children?: ReactNode;
}

export function EmptyFrame({
  title = "Nothing to show yet",
  message = "There's nothing on this page right now. When there is, it will appear here.",
  children,
}: EmptyFrameProps) {
  return (
    <div
      data-testid="empty-frame"
      className="flex flex-col items-center px-6 py-[72px] text-center"
    >
      <div className="bg-muted text-muted-foreground mb-5 grid size-14 place-items-center rounded-full">
        <Inbox aria-hidden="true" className="size-6" strokeWidth={1.75} />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-[420px] text-[15px] leading-relaxed">
        {message}
      </p>
      {children ? <div className="mt-6 flex gap-3">{children}</div> : null}
    </div>
  );
}
