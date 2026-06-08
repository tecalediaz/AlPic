import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const UI_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  "family=Elms+Sans:ital,wght@0,100..900;1,100..900&" +
  "family=Quicksand:wght@300..700&" +
  "family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&" +
  "display=swap";

const CANVAS_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Poppins:wght@400;700",
    "family=Nunito:wght@400;700",
    "family=Comfortaa:wght@400;700",
    "family=Roboto:wght@400;700",
    "family=Open+Sans:wght@400;700",
    "family=Lato:wght@400;700",
    "family=Bebas+Neue",
    "family=Anton",
    "family=Bungee",
    "family=Russo+One",
    "family=Righteous",
    "family=Oswald:wght@400;700",
    "family=Montserrat:wght@400;700",
    "family=Raleway:wght@400;700",
    "family=Bangers",
    "family=Fredoka+One",
    "family=Abril+Fatface",
    "family=Pacifico",
    "family=Press+Start+2P",
    "family=Lobster",
    "family=Dancing+Script:wght@400;700",
    "family=Caveat:wght@400;700",
    "family=Amatic+SC:wght@400;700",
    "family=Permanent+Marker",
    "family=Satisfy",
    "family=Playfair+Display:wght@400;700",
    "family=Merriweather:wght@400;700",
    "family=Cinzel:wght@400;700",
  ].join("&") +
  "&display=swap";

export const metadata: Metadata = {
  title: "Alpic",
  description: "Edición automática de fotos para redes sociales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={UI_FONTS_URL} rel="stylesheet" />
        <link href={CANVAS_FONTS_URL} rel="stylesheet" />
      </head>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
