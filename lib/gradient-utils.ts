import { Gradient, type TFiller } from "fabric";
import type { GradientLayerData } from "@/types";

export const TRANSPARENT_COLOR = "transparent";

export const GRADIENT_ANGLE_MIN = -360;
export const GRADIENT_ANGLE_MAX = 360;

export function clampGradientAngle(angle: number): number {
  return Math.min(
    GRADIENT_ANGLE_MAX,
    Math.max(GRADIENT_ANGLE_MIN, Math.round(angle)),
  );
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveGradientStop(color: string, partnerColor: string): string {
  if (color !== TRANSPARENT_COLOR) return color;
  if (partnerColor !== TRANSPARENT_COLOR && partnerColor.startsWith("#")) {
    return hexToRgba(partnerColor, 0);
  }
  return "rgba(0, 0, 0, 0)";
}

export function buildGradientFill(
  width: number,
  height: number,
  data: GradientLayerData,
): TFiller {
  const c1 = resolveGradientStop(data.color1, data.color2);
  const c2 = resolveGradientStop(data.color2, data.color1);

  // Las posiciones se guardan en [0,1]; nos aseguramos de que estén ordenadas.
  const rawA = data.stop1 ?? 0;
  const rawB = data.stop2 ?? 1;
  const [offA, colA, offB, colB] =
    rawA <= rawB ? [rawA, c1, rawB, c2] : [rawB, c2, rawA, c1];

  const colorStops: { offset: number; color: string }[] = [];
  if (offA > 0) colorStops.push({ offset: 0, color: colA });
  colorStops.push({ offset: offA, color: colA });
  colorStops.push({ offset: offB, color: colB });
  if (offB < 1) colorStops.push({ offset: 1, color: colB });

  if (data.gradientType === "radial") {
    return new Gradient({
      type: "radial",
      coords: {
        x1: width / 2,
        y1: height / 2,
        r1: 0,
        x2: width / 2,
        y2: height / 2,
        r2: Math.max(width, height) / 2,
      },
      colorStops,
    });
  }

  const angle = clampGradientAngle(data.angle ?? 0);
  const rad = (angle * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const halfLength = Math.sqrt(width * width + height * height) / 2;

  return new Gradient({
    type: "linear",
    coords: {
      x1: cx - Math.cos(rad) * halfLength,
      y1: cy - Math.sin(rad) * halfLength,
      x2: cx + Math.cos(rad) * halfLength,
      y2: cy + Math.sin(rad) * halfLength,
    },
    colorStops,
  });
}

export function getDefaultGradientLayerData(): GradientLayerData {
  return {
    gradientType: "linear",
    color1: "#D62553",
    color2: TRANSPARENT_COLOR,
    angle: 0,
  };
}
