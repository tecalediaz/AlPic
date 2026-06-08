import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Creá tu plantilla",
  description:
    "Generá tu código de acceso y diseñá tu primera plantilla para Instagram, TikTok, Stories o Reels. Gratis y sin registro.",
  path: "/new",
});

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
