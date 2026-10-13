import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { DesktopOnlyGate } from "@/components/layout/DesktopOnlyGate";

export const metadata: Metadata = buildPageMetadata({
  title: "Editor de plantillas",
  description: "Editor local de plantillas de AlPic.",
  noIndex: true,
});

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <DesktopOnlyGate>{children}</DesktopOnlyGate>;
}
