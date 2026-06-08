import type { AspectRatio } from "@/types";
import { ASPECT_RATIOS, CANVAS_DISPLAY_SIZE } from "@/lib/constants";

export function getCanvasDimensions(aspectRatio: AspectRatio) {
  const { width, height } = ASPECT_RATIOS[aspectRatio];
  const isLandscape = width > height;

  if (isLandscape) {
    return {
      displayWidth: CANVAS_DISPLAY_SIZE,
      displayHeight: Math.round((CANVAS_DISPLAY_SIZE * height) / width),
      nativeWidth: width,
      nativeHeight: height,
    };
  }

  return {
    displayWidth: Math.round((CANVAS_DISPLAY_SIZE * width) / height),
    displayHeight: CANVAS_DISPLAY_SIZE,
    nativeWidth: width,
    nativeHeight: height,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getInitialFabricJson(_aspectRatio: AspectRatio) {
  return {
    version: "6.6.1",
    objects: [],
    background: "transparent",
  };
}

export function estimateJsonSize(json: object): number {
  return new Blob([JSON.stringify(json)]).size;
}

export async function loadImageFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";
