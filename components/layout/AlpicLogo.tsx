import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "onDark" | "onLight";

interface AlpicLogoProps {
  /** `onDark` = logo blanco (fondos oscuros). `onLight` = logo magenta (fondos claros). */
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  priority?: boolean;
}

const SIZES = {
  sm: { width: 72, height: 28 },
  md: { width: 96, height: 36 },
  lg: { width: 132, height: 50 },
} as const;

export function AlpicLogo({
  variant = "onDark",
  size = "md",
  href,
  className,
  priority = false,
}: AlpicLogoProps) {
  const src = variant === "onDark" ? "/alpic-logo-white.png" : "/alpic-logo-primary.png";
  const dims = SIZES[size];

  const image = (
    <Image
      src={src}
      alt="Alpic"
      width={dims.width}
      height={dims.height}
      priority={priority}
      className={cn("block h-auto w-auto max-w-full object-contain", className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-85">
        {image}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{image}</span>;
}
