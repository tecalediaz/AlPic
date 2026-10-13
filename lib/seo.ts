import type { Metadata } from "next";

export const SITE_URL = "https://alpicxd.netlify.app";
export const SITE_NAME = "AlPic";
export const SITE_DESCRIPTION = "AlPic es un proyecto personal de tecalediaz: un editor de plantillas reutilizables para preparar imágenes para redes sociales. Probá la demo local y explorá el código abierto.";

export function buildPageMetadata({ title, description = SITE_DESCRIPTION, noIndex = false }: { title?: string; description?: string; path?: string; noIndex?: boolean }): Metadata {
  return {
    title: title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — proyecto de tecalediaz`,
    description,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — proyecto de tecalediaz`,
  description: SITE_DESCRIPTION,
  authors: [{ name: "tecalediaz", url: "https://tecalediaz.com" }],
  creator: "tecalediaz",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    title: `${SITE_NAME} — proyecto de tecalediaz`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AlPic, editor de imágenes creado por tecalediaz" }],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: ["/og.png"] },
};

export function buildStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    codeRepository: "https://github.com/tecalediaz/AlPic",
    author: { "@type": "Person", name: "tecalediaz", url: "https://tecalediaz.com" },
    programmingLanguage: ["TypeScript", "React"],
  };
}
