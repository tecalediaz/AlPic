"use client";

import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  Group,
  IText,
  Rect,
  type FabricObject as FabricObjectType,
} from "fabric";
import type { GradientLayerData } from "@/types";
import {
  buildGradientFill,
  clampGradientAngle,
  getDefaultGradientLayerData,
} from "@/lib/gradient-utils";
import { getCanvasDimensions } from "@/lib/canvas-config";
import {
  applyHighQualityObjectSettings,
  calcFitScale,
  embedFabricImageSource,
} from "@/lib/image-export";

export const FABRIC_SERIALIZE_PROPS = ["name", "id", "data"] as const;

export function initFabricCustomProperties() {
  if (!FabricObject.customProperties.includes("data")) {
    FabricObject.customProperties.push("data", "id", "name");
  }
}

/** Asigna un id estable a un objeto si todavía no tiene uno. */
export function ensureObjectId(obj: FabricObjectType): string {
  const withId = obj as FabricObjectType & { id?: string };
  if (!withId.id) {
    withId.id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `obj_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
  return withId.id;
}

export function getObjectId(obj: FabricObjectType): string {
  return ensureObjectId(obj);
}

export function ensureObjectIds(canvas: Canvas) {
  for (const obj of canvas.getObjects()) {
    ensureObjectId(obj);
  }
}

// ─── Gradient layers ─────────────────────────────────────────────────────────

export function createGradientLayer(canvasW: number, canvasH: number) {
  const data = getDefaultGradientLayerData();
  return new Rect({
    name: "gradient-layer",
    left: 0,
    top: 0,
    width: canvasW,
    height: canvasH,
    fill: buildGradientFill(canvasW, canvasH, data),
    strokeWidth: 0,
    selectable: true,
    evented: true,
    data,
  });
}

export function findGradientLayers(canvas: Canvas): Rect[] {
  return canvas
    .getObjects()
    .filter((obj) => (obj as FabricObjectType & { name?: string }).name === "gradient-layer") as Rect[];
}

export function isGradientLayer(obj: FabricObjectType | undefined) {
  return (obj as FabricObjectType & { name?: string })?.name === "gradient-layer";
}

export function getGradientLayerData(obj: FabricObjectType): GradientLayerData {
  const data = (obj as FabricObjectType & { data?: GradientLayerData }).data;
  const defaults = getDefaultGradientLayerData();
  return {
    gradientType: data?.gradientType ?? defaults.gradientType,
    color1: data?.color1 ?? defaults.color1,
    color2: data?.color2 ?? defaults.color2,
    angle: data?.angle ?? defaults.angle,
    stop1: data?.stop1 ?? 0,
    stop2: data?.stop2 ?? 1,
  };
}

export function getGradientLayerDimensions(obj: Rect) {
  const width = Math.max(1, (obj.width ?? 1) * (obj.scaleX ?? 1));
  const height = Math.max(1, (obj.height ?? 1) * (obj.scaleY ?? 1));
  return { width, height };
}

export function applyGradientLayerFill(obj: Rect, data: GradientLayerData) {
  const { width, height } = getGradientLayerDimensions(obj);
  obj.set({
    data,
    width,
    height,
    scaleX: 1,
    scaleY: 1,
    fill: buildGradientFill(width, height, data),
  });
}

export function getGradientLayerDisplayAngle(obj: FabricObjectType): number {
  const data = getGradientLayerData(obj);
  return clampGradientAngle((data.angle ?? 0) + (obj.angle ?? 0));
}

export function syncGradientLayerTransform(obj: Rect): boolean {
  const scaleX = obj.scaleX ?? 1;
  const scaleY = obj.scaleY ?? 1;
  const fabricAngle = obj.angle ?? 0;
  const needsScaleSync = scaleX !== 1 || scaleY !== 1;
  const needsAngleSync = fabricAngle !== 0;
  if (!needsScaleSync && !needsAngleSync) return false;

  const data = getGradientLayerData(obj);
  const nextData = needsAngleSync
    ? { ...data, angle: clampGradientAngle((data.angle ?? 0) + fabricAngle) }
    : data;
  const width = Math.max(1, (obj.width ?? 1) * scaleX);
  const height = Math.max(1, (obj.height ?? 1) * scaleY);

  obj.set({
    data: nextData,
    width,
    height,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    fill: buildGradientFill(width, height, nextData),
  });
  obj.setCoords();
  return true;
}

/** @deprecated Alias de compatibilidad */
export function syncGradientLayerScale(obj: Rect): boolean {
  return syncGradientLayerTransform(obj);
}

/** @deprecated Alias de compatibilidad */
export function syncGradientLayerRotation(obj: Rect): boolean {
  return syncGradientLayerTransform(obj);
}

export function rehydrateGradientLayers(canvas: Canvas) {
  for (const obj of canvas.getObjects()) {
    if (!isGradientLayer(obj)) continue;
    const rect = obj as Rect;
    const synced = syncGradientLayerTransform(rect);
    if (!synced) {
      applyGradientLayerFill(rect, getGradientLayerData(rect));
    }
  }
}

export function placeGradientLayer(canvas: Canvas, layer: Rect) {
  canvas.add(layer);
  canvas.sendObjectToBack(layer);
}

// ─── Object type guards ───────────────────────────────────────────────────────

export function isUserPhoto(obj: FabricObjectType | undefined) {
  return (obj as FabricObjectType & { name?: string })?.name === "user-photo";
}

export function isUserText(obj: FabricObjectType | undefined) {
  return (obj as FabricObjectType & { name?: string })?.name === "user-text";
}

export function addTextToCanvas(
  canvas: Canvas,
  canvasWidth: number,
  canvasHeight: number,
  options?: { name?: string },
) {
  const text = new IText("Texto", {
    left: canvasWidth / 2 - 40,
    top: canvasHeight / 2 - 20,
    fontFamily: "Elms Sans",
    fontSize: 32,
    fill: "#ffffff",
    name: options?.name,
    selectable: true,
    evented: true,
  });
  applyHighQualityObjectSettings(text);
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  return text;
}

export function isSVGGroup(obj: FabricObjectType | undefined) {
  return (obj as FabricObjectType & { name?: string })?.name === "svg-group";
}

export interface LoadSVGOptions {
  /** Ancho escalado exacto en px del lienzo (p. ej. al reemplazar un SVG). */
  targetWidth?: number;
  /** Si no hay targetWidth, solo reduce si supera estos límites (fit contain). */
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Parsea SVG con Fabric. Por defecto conserva el tamaño nativo del archivo;
 * solo escala hacia abajo si no cabe en maxWidth × maxHeight.
 */
export async function loadSVGAsGroup(
  svgString: string,
  options: number | LoadSVGOptions = {},
) {
  const opts: LoadSVGOptions =
    typeof options === "number" ? { targetWidth: options } : options;

  const { loadSVGFromString, util, Group } = await import("fabric");
  const { objects, options: svgOptions } = await loadSVGFromString(svgString);

  const validObjects = (objects ?? []).filter(
    (o): o is FabricObjectType => o !== null,
  );
  if (validObjects.length === 0) return null;

  const shape =
    validObjects.length === 1
      ? validObjects[0]
      : util.groupSVGElements(validObjects, svgOptions);

  const group =
    shape instanceof Group
      ? shape
      : new Group([shape], {
          width: shape.width,
          height: shape.height,
          left: shape.left,
          top: shape.top,
        });

  const w = group.width ?? 1;
  const h = group.height ?? 1;
  let scale = 1;

  if (opts.targetWidth) {
    scale = opts.targetWidth / w;
  } else if (opts.maxWidth && opts.maxHeight) {
    scale = calcFitScale(w, h, opts.maxWidth, opts.maxHeight);
  }

  group.set({ name: "svg-group", scaleX: scale, scaleY: scale });
  applyHighQualityObjectSettings(group);
  return group;
}

export function isTextObject(obj: FabricObjectType | undefined) {
  return obj?.type === "i-text" || obj?.type === "text" || obj?.type === "textbox";
}

export function isImageObject(obj: FabricObjectType | undefined) {
  const name = (obj as FabricObjectType & { name?: string })?.name;
  return obj?.type === "image" && name !== "user-photo";
}

export function isShapeObject(obj: FabricObjectType | undefined) {
  if (isGradientLayer(obj)) return false;
  return obj?.type === "rect" || obj?.type === "circle";
}

export function isCircleObject(obj: FabricObjectType | undefined) {
  return obj instanceof Circle || obj?.type === "circle";
}

// ─── Canvas serialization ─────────────────────────────────────────────────────

type FabricJsonObject = Record<string, unknown>;

function fabricJsonType(obj: FabricJsonObject): string {
  return String(obj.type ?? "").toLowerCase();
}

function isFabricImageJson(obj: FabricJsonObject): boolean {
  return fabricJsonType(obj) === "image";
}

function isFabricGroupJson(obj: FabricJsonObject): boolean {
  return fabricJsonType(obj) === "group";
}

function isStaleBlobImage(obj: FabricJsonObject): boolean {
  return (
    isFabricImageJson(obj) &&
    typeof obj.src === "string" &&
    obj.src.startsWith("blob:")
  );
}

function sanitizeFabricObjects(
  objects: FabricJsonObject[],
): FabricJsonObject[] {
  return objects
    .filter((o) => o.name !== "image-slot" && !isStaleBlobImage(o))
    .map((o) => {
      if (isFabricGroupJson(o) && Array.isArray(o.objects)) {
        return {
          ...o,
          objects: sanitizeFabricObjects(o.objects as FabricJsonObject[]),
        };
      }
      return o;
    });
}

/** Cuenta imágenes con blob: URL inválidas (sesión anterior). */
export function countStaleBlobImages(json: object): number {
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.objects)) return 0;

  function walk(objects: FabricJsonObject[]): number {
    return objects.reduce((count, o) => {
      let n = isStaleBlobImage(o) ? 1 : 0;
      if (isFabricGroupJson(o) && Array.isArray(o.objects)) {
        n += walk(o.objects as FabricJsonObject[]);
      }
      return count + n;
    }, 0);
  }

  return walk(obj.objects as FabricJsonObject[]);
}

/**
 * Elimina objetos legacy (image-slot) y blob: URLs caducadas antes de cargar.
 * Los blob: no sobreviven recargas de página ni otra pestaña.
 */
export function sanitizeFabricJson(json: object): object {
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.objects)) return json;
  return {
    ...obj,
    objects: sanitizeFabricObjects(obj.objects as FabricJsonObject[]),
  };
}

function embedImageSourcesOnObject(obj: FabricObjectType) {
  if (obj.type === "image") {
    embedFabricImageSource(obj as FabricImage);
    return;
  }
  if (obj.type === "group" && obj instanceof Group) {
    for (const child of obj.getObjects()) {
      embedImageSourcesOnObject(child);
    }
  }
}

export function generateThumbnail(canvas: Canvas, displayWidth: number) {
  return canvas.toDataURL({
    format: "jpeg",
    quality: 0.6,
    multiplier: 400 / displayWidth,
  });
}

export function serializeCanvas(canvas: Canvas) {
  for (const obj of canvas.getObjects()) {
    embedImageSourcesOnObject(obj);
  }

  const json = canvas.toObject([...FABRIC_SERIALIZE_PROPS]) as Record<string, unknown>;
  // La imagen de fondo nunca se persiste — se aplica en tiempo de ejecución.
  delete json.backgroundImage;
  return json;
}

export { getCanvasDimensions };
