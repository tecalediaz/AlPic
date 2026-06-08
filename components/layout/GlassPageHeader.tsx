import Link from "next/link";
import { cn } from "@/lib/utils";

interface GlassPageStep {
  num: number;
  label: string;
  status: "active" | "done" | "pending";
}

interface GlassPageHeaderProps {
  backHref?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  steps?: GlassPageStep[];
  actions?: React.ReactNode;
}

export function GlassPageHeader({
  backHref,
  backLabel = "← Volver al inicio",
  title,
  subtitle,
  steps,
  actions,
}: GlassPageHeaderProps) {
  return (
    <header className="glass-page-header">
      {backHref && (
        <Link href={backHref} className="liquid-glass-btn glass-header-action glass-header-action--left">
          {backLabel}
        </Link>
      )}

      {(title || subtitle) && (
        <div className="glass-page-header__center">
          {title && <h1 className="glass-header-title">{title}</h1>}
          {subtitle && <p className="glass-header-subtitle">{subtitle}</p>}
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="glass-page-steps">
          {steps.map((step) => (
            <div
              key={step.num}
              className={cn(
                "glass-page-step",
                step.status === "active" && "glass-page-step--active",
                step.status === "done" && "glass-page-step--done",
              )}
            >
              <span className="glass-page-step__num">{step.num}</span>
              <span className="glass-page-step__label">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div className="glass-header-action glass-header-action--right">{actions}</div>
      )}
    </header>
  );
}
