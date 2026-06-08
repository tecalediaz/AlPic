import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "loader--sm",
  md: "loader--md",
  lg: "loader--lg",
} as const;

export function Loader({ className, size = "sm" }: LoaderProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn("loader", sizeClass[size], className)}
    />
  );
}

export function LoaderCenter({ className, size = "md", ...props }: LoaderProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label="Cargando"
    >
      <Loader size={size} {...props} />
    </div>
  );
}
