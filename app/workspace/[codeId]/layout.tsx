import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Workspace",
  description: "Editor de fotos privado de Alpic.",
  noIndex: true,
});

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
