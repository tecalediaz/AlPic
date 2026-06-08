import { AppHeader } from "@/components/layout/AppHeader";
import { PAGE_MAX_WIDTH } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface PageShellProps {
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  centerTitle?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  fullHeight?: boolean;
  fullWidth?: boolean;
  noPadding?: boolean;
}

export function PageShell({
  backHref,
  backLabel,
  onBack,
  title,
  subtitle,
  centerTitle,
  actions,
  children,
  fullHeight = false,
  fullWidth = false,
  noPadding = false,
}: PageShellProps) {
  return (
    <div className={cn("flex flex-col bg-background", fullHeight ? "h-screen" : "min-h-screen")}>
      <AppHeader
        backHref={backHref}
        backLabel={backLabel}
        onBack={onBack}
        title={title}
        subtitle={subtitle}
        centerTitle={centerTitle}
        actions={actions}
      />
      <div
        className={cn("flex-1", !noPadding && "px-8 py-6", !fullWidth && "mx-auto w-full")}
        style={!fullWidth ? { maxWidth: PAGE_MAX_WIDTH } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
