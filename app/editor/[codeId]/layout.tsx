import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Editor de plantillas",
  description: "Editor privado de plantillas de Alpic.",
  noIndex: true,
});

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
