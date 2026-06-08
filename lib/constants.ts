import type { AspectRatio } from "@/types";

export const ASPECT_RATIOS: Record<
  AspectRatio,
  { label: string; width: number; height: number }
> = {
  "1:1": { label: "Cuadrado (Instagram)", width: 1080, height: 1080 },
  "4:5": { label: "Portrait (Instagram Feed)", width: 1080, height: 1350 },
  "9:16": { label: "Story / Reels / TikTok", width: 1080, height: 1920 },
  "16:9": { label: "Horizontal (YouTube/Twitter)", width: 1920, height: 1080 },
  "1.91:1": { label: "Facebook / LinkedIn", width: 1200, height: 628 },
};

export const CANVAS_DISPLAY_SIZE = 600;

export const FONT_GROUPS = [
  {
    label: "Modernas",
    fonts: ["Elms Sans", "Sansation", "Quicksand", "Poppins", "Nunito", "Comfortaa", "Roboto", "Open Sans", "Lato"],
  },
  {
    label: "Display / Redes",
    fonts: ["Bebas Neue", "Anton", "Bungee", "Russo One", "Righteous", "Oswald", "Montserrat", "Raleway"],
  },
  {
    label: "Divertidas",
    fonts: ["Bangers", "Fredoka One", "Abril Fatface", "Pacifico", "Press Start 2P"],
  },
  {
    label: "Caligrafía",
    fonts: ["Lobster", "Dancing Script", "Caveat", "Amatic SC", "Permanent Marker", "Satisfy"],
  },
  {
    label: "Clásicas",
    fonts: ["Playfair Display", "Merriweather", "Cinzel"],
  },
] as const;

export const FONT_FAMILIES = FONT_GROUPS.flatMap((g) => g.fonts);

/** Colores más usados para texto en workspace (blanco, negro, marca, amarillo, acento). */
export const WORKSPACE_QUICK_TEXT_COLORS = [
  "#ffffff",
  "#000000",
  "#D62553",
  "#FACC15",
  "#00B4D8",
] as const;
