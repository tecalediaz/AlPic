export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "1.91:1";


export interface Code {
  id: string;
  name: string | null;
  created_at: string;
}

export interface Style {
  id: string;
  code_id: string;
  name: string;
  fabric_json: object;
  aspect_ratio: AspectRatio;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface StyleListItem {
  id: string;
  code_id: string;
  name: string;
  aspect_ratio: AspectRatio;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface GradientLayerData {
  gradientType: "linear" | "radial";
  color1: string;
  color2: string;
  angle?: number;
  /** Posición del color 1 en el degradado (0–1). Por defecto 0. */
  stop1?: number;
  /** Posición del color 2 en el degradado (0–1). Por defecto 1. */
  stop2?: number;
}

export interface FabricFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  blur: number;
}
