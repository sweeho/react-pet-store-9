import { Bird, Cat, Dog, Fish, PawPrint, Turtle } from "lucide-react";

import { cn } from "@/utils";

const ICONS: Record<string, typeof Fish> = {
  FISH: Fish,
  DOGS: Dog,
  CATS: Cat,
  BIRDS: Bird,
  REPTILES: Turtle,
};

const TINTS = [
  "bg-[color-mix(in_oklch,var(--chart-1)_14%,white)]",
  "bg-[color-mix(in_oklch,var(--chart-2)_14%,white)]",
  "bg-[color-mix(in_oklch,var(--chart-3)_12%,white)]",
  "bg-[color-mix(in_oklch,var(--chart-4)_22%,white)]",
  "bg-[color-mix(in_oklch,var(--chart-5)_18%,white)]",
];

/** A tinted placeholder tile with the category's icon; the catalog has no image files to serve. */
export function Thumb({
  categoryId,
  className,
  iconSize = 40,
}: {
  categoryId: string;
  className?: string;
  iconSize?: number;
}): React.JSX.Element {
  const Icon = ICONS[categoryId] ?? PawPrint;
  const tint = TINTS[[...categoryId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];
  return (
    <div
      aria-hidden="true"
      className={cn("grid flex-none place-items-center rounded-lg", tint, className)}
    >
      <Icon size={iconSize} strokeWidth={1.5} className="opacity-80" />
    </div>
  );
}
