import { FabricImage, Group, type FabricObject } from "fabric";
import { loadImageFromFile } from "@/lib/canvas-config";

/** Lado mayor máximo del archivo exportado (px). */
export const MAX_EXPORT_SIDE_PX = 8000;

export function getImageNaturalSize(
  source: string | HTMLImageElement,
): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    if (source instanceof HTMLImageElement) {
      resolve({
        w: source.naturalWidth || source.width,
        h: source.naturalHeight || source.height,
      });
      return;
    }
    const img = new Image();
    img.onload = () =>
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = source;
  });
}

/** Escala uniforme para que quepa dentro de un rectángulo sin agrandar. */
export function calcFitScale(
  nativeW: number,
  nativeH: number,
  maxW: number,
  maxH: number,
): number {
  if (nativeW <= 0 || nativeH <= 0) return 1;
  if (nativeW <= maxW && nativeH <= maxH) return 1;
  return Math.min(maxW / nativeW, maxH / nativeH);
}

export function centerObjectOnCanvas(
  obj: FabricObject,
  canvasW: number,
  canvasH: number,
) {
  const w = (obj.width ?? 0) * (obj.scaleX ?? 1);
  const h = (obj.height ?? 0) * (obj.scaleY ?? 1);
  obj.set({
    left: canvasW / 2 - w / 2,
    top: canvasH / 2 - h / 2,
  });
}

export function applyCanvasRenderQuality(canvas: {
  getContext: () => CanvasRenderingContext2D | null;
}) {
  const ctx = canvas.getContext();
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }
}

/**
 * Ajustes para que imágenes, SVG y grupos conserven resolución al escalar
 * y al exportar con multiplicador (evita cachés de baja resolución de Fabric).
 */
export function applyHighQualityObjectSettings(obj: FabricObject) {
  if (obj.type === "image") {
    obj.set({
      objectCaching: false,
      minimumScaleTrigger: 0,
      imageSmoothing: true,
      noScaleCache: true,
    });
    return;
  }

  if (obj.type === "group") {
    obj.set({ objectCaching: false });
    if (obj instanceof Group) {
      for (const child of obj.getObjects()) {
        applyHighQualityObjectSettings(child);
      }
    }
  }
}

/** @deprecated Usar applyHighQualityObjectSettings */
export function applyHighQualityImageSettings(obj: FabricObject) {
  applyHighQualityObjectSettings(obj);
}

export function applyHighQualityToAllObjects(objects: FabricObject[]) {
  for (const obj of objects) {
    applyHighQualityObjectSettings(obj);
  }
}

/** Convierte un HTMLImageElement cargado a data URL PNG (sin pérdida). */
export function imageElementToDataUrl(el: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = el.naturalWidth;
  canvas.height = el.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto del canvas");
  ctx.drawImage(el, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Carga una imagen desde File preservando resolución nativa.
 * Usa data URL para que el src persista al guardar el estilo en la BD.
 */
export async function loadFabricImageFromFile(file: File): Promise<FabricImage> {
  const dataUrl = await loadImageFromFile(file);
  return loadFabricImageFromUrl(dataUrl);
}

/** Asegura que una FabricImage tenga src embebido (data URL) antes de serializar. */
export function embedFabricImageSource(img: FabricImage) {
  const el = img.getElement() as HTMLImageElement | undefined;
  if (!el?.naturalWidth) return;

  const current =
    (img as FabricImage & { src?: string }).src ??
    el.currentSrc ??
    el.src;

  if (current.startsWith("data:")) return;

  const dataUrl = imageElementToDataUrl(el);
  img.set({ src: dataUrl } as object);
}

/** Igual que loadFabricImageFromFile pero desde una URL/data URL/blob URL. */
export async function loadFabricImageFromUrl(src: string): Promise<FabricImage> {
  const isBlob = src.startsWith("blob:");
  const isData = src.startsWith("data:");
  const el = document.createElement("img");

  if (!isBlob && !isData) {
    el.crossOrigin = "anonymous";
  }

  await new Promise<void>((resolve, reject) => {
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    el.src = src;
  });

  const img = new FabricImage(el);
  applyHighQualityObjectSettings(img);
  return img;
}

export function calcPhotoExportMultiplier(
  photoScale: number,
  displayW: number,
  displayH: number,
): number {
  if (!photoScale || photoScale <= 0) return 1;
  const mult = 1 / photoScale;
  const maxMult = MAX_EXPORT_SIDE_PX / Math.max(displayW, displayH);
  return Math.min(mult, maxMult);
}

export function getExportDimensions(
  displayW: number,
  displayH: number,
  multiplier: number,
) {
  return {
    width: Math.round(displayW * multiplier),
    height: Math.round(displayH * multiplier),
  };
}

export function findUserPhoto(
  objects: FabricObject[],
): (FabricImage & { name?: string }) | undefined {
  return objects.find(
    (o) => (o as FabricObject & { name?: string }).name === "user-photo",
  ) as FabricImage | undefined;
}
