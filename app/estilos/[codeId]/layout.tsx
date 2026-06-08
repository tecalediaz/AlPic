import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Mis estilos",
  description: "Panel privado de plantillas de Alpic.",
  noIndex: true,
});

export default function EstilosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
