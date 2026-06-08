import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  centerTitle?: boolean;
  actions?: React.ReactNode;
}

export function AppHeader({
  backHref,
  backLabel = "Volver",
  onBack,
  title,
  subtitle,
  centerTitle = false,
  actions,
}: AppHeaderProps) {
  const backButton = (backHref || onBack) && (
    <Button
      variant="ghost"
      size="sm"
      className="header-btn rounded-full"
      asChild={!!backHref}
      onClick={onBack}
    >
      {backHref ? (
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      ) : (
        <>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </>
      )}
    </Button>
  );

  if (centerTitle) {
    return (
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-secondary px-6 text-secondary-foreground">
        <div className="flex items-center justify-start">{backButton}</div>
        <h1 className="truncate px-4 text-center text-base font-semibold">{title}</h1>
        <div className="flex items-center justify-end gap-2">{actions}</div>
      </header>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-secondary px-6 text-secondary-foreground">
      {backButton}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-white/70">{subtitle}</p>}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
