import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, className, filled = false }: IconProps): React.ReactElement {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{ fontVariationSettings: filled ? '"FILL" 1' : '"FILL" 0' }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
