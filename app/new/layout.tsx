import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Abrir demo",
  description: "Abrí la demo local de AlPic y creá tu primera plantilla.",
  path: "/new",
});

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
