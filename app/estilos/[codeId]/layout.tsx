import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { DesktopOnlyGate } from "@/components/layout/DesktopOnlyGate";

export const metadata: Metadata = buildPageMetadata({
  title: "Mis estilos",
  description: "Estilos guardados localmente en este navegador.",
  noIndex: true,
});

export default function EstilosLayout({ children }: { children: React.ReactNode }) {
  return <DesktopOnlyGate>{children}</DesktopOnlyGate>;
}
