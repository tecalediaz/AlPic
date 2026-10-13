import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { DesktopOnlyGate } from "@/components/layout/DesktopOnlyGate";

export const metadata: Metadata = buildPageMetadata({
  title: "Workspace",
  description: "Aplicá una plantilla a tus fotos en el navegador.",
  noIndex: true,
});

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <DesktopOnlyGate>{children}</DesktopOnlyGate>;
}
