import type { Metadata } from "next";

export const SITE_URL = "https://alpicxd.netlify.app";

export const SITE_NAME = "Alpic";

export const SITE_TAGLINE = "Editor automático de imágenes para redes sociales";

export const SITE_DESCRIPTION =
  "Creá plantillas para Instagram, TikTok y más. Subí tus fotos y Alpic aplica tu diseño en un clic. Para creadores de contenido en Argentina y Latinoamérica.";

export const SITE_KEYWORDS = [
  "editor de imágenes para redes sociales",
  "plantillas para Instagram",
  "plantillas para Instagram Argentina",
  "editor automático de fotos",
  "diseño rápido para redes sociales",
  "creador de plantillas gratis",
  "plantillas para stories y reels",
  "editor de fotos en un clic",
  "plantillas para TikTok",
  "editor para creadores de contenido",
  "edición masiva de fotos",
  "plantillas para redes sociales LATAM",
  "herramienta de diseño online",
  "marketing digital visual",
  "editar fotos para redes sin Photoshop",
  "plantillas rápidas para redes sociales",
] as const;

export const SOCIAL_PROFILES = {
  instagram: "https://www.instagram.com/alediaztec",
  x: "https://x.com/tecalediaz",
  facebook: "https://www.facebook.com/tecalediaz",
  tiktok: "https://www.tiktok.com/@tecalediaz",
  youtube: "https://www.youtube.com/@tecalediaz",
} as const;

export const PRIVATE_ROUTE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const canonical = absoluteUrl(path);

  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    robots: noIndex ? PRIVATE_ROUTE_ROBOTS : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "es_AR",
      alternateLocale: ["es_MX", "es_CO", "es_CL", "es_ES"],
      url: canonical,
      siteName: SITE_NAME,
      title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Alpic — editor automático de imágenes para redes sociales",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description,
      images: ["/og.png"],
      creator: "@tecalediaz",
    },
  };
}

export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: "Alpic", url: SOCIAL_PROFILES.instagram }],
  creator: "Alpic",
  publisher: SITE_NAME,
  category: "technology",
  alternates: {
    canonical: "/",
    languages: { "es-AR": "/", "es": "/" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    alternateLocale: ["es_MX", "es_CO", "es_CL", "es_ES"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Alpic — editor automático de imágenes para redes sociales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
    creator: "@tecalediaz",
  },
  other: {
    "geo.region": "AR",
    "geo.placename": "Latinoamérica",
    "content-language": "es-AR",
  },
};

export function buildStructuredData() {
  const sameAs = Object.values(SOCIAL_PROFILES);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icon.png"),
        },
        sameAs,
        areaServed: {
          "@type": "GeoCircle",
          geoMidpoint: {
            "@type": "GeoCoordinates",
            latitude: -34.6037,
            longitude: -58.3816,
          },
          geoRadius: "5000000",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "es-AR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "DesignApplication",
        applicationSubCategory: "Photo Editor",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        description: SITE_DESCRIPTION,
        inLanguage: "es-AR",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        audience: {
          "@type": "Audience",
          audienceType:
            "Creadores de contenido y personas sin experiencia en diseño gráfico",
          geographicArea: {
            "@type": "Place",
            name: "Latinoamérica",
          },
        },
        featureList: [
          "Plantillas personalizables para redes sociales",
          "Edición automática de imágenes en un clic",
          "Formatos para Instagram, TikTok, Stories y Reels",
          "Acceso con código único, sin email ni contraseña",
          "Plantillas guardadas para reutilizar el mismo estilo",
        ],
        screenshot: absoluteUrl("/og.png"),
        provider: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Qué es Alpic?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Alpic es un editor automático de imágenes para redes sociales. Definís una plantilla con tu estilo, la guardás y después subís las fotos que quieras editar: el sistema aplica el diseño por vos en un solo clic.",
            },
          },
          {
            "@type": "Question",
            name: "¿Necesito crear una cuenta para usar Alpic?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Alpic funciona con un código de acceso único que creás al registrar tu primer estilo. No hace falta email ni contraseña.",
            },
          },
          {
            "@type": "Question",
            name: "¿Para quién está pensado Alpic?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Para creadores de contenido, emprendedores y equipos que publican en redes sin experiencia en diseño gráfico y necesitan mantener un estilo visual consistente en cada publicación.",
            },
          },
          {
            "@type": "Question",
            name: "¿Qué problema resuelve Alpic?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Te evita abrir un editor complejo una y otra vez para repetir el mismo diseño. Creás la plantilla una vez, guardás el estilo y exportás todas tus fotos editadas de forma rápida y uniforme.",
            },
          },
          {
            "@type": "Question",
            name: "¿Sirve para Instagram, TikTok y otras redes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sí. Podés armar plantillas en formatos como 1:1, 4:5, 9:16 y 16:9, pensados para feed, stories, reels y publicaciones horizontales.",
            },
          },
        ],
      },
    ],
  };
}
