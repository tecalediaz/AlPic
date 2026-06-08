"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Canvas, type FabricObject } from "fabric";
import {
  countStaleBlobImages,
  initFabricCustomProperties,
  rehydrateGradientLayers,
  sanitizeFabricJson,
} from "@/lib/fabric-utils";
import {
  applyCanvasRenderQuality,
  applyHighQualityObjectSettings,
  applyHighQualityToAllObjects,
  calcPhotoExportMultiplier,
  findUserPhoto,
  loadFabricImageFromFile,
  loadFabricImageFromUrl,
} from "@/lib/image-export";
import type { AspectRatio } from "@/types";
import { getCanvasDimensions } from "@/lib/canvas-config";

export interface ProcessingCanvasHandle {
  getCanvas: () => Canvas | null;
  exportImage: () => string | null;
  getExportMultiplier: () => number;
  setUserPhoto: (source: string | File) => Promise<void>;
}

interface ProcessingCanvasProps {
  aspectRatio: AspectRatio;
  fabricJson: object;
  onReady?: () => void;
  onError?: (message: string) => void;
  /** Aviso no bloqueante (p. ej. imágenes con blob URL caducada). */
  onWarning?: (message: string) => void;
  /** Se dispara al cambiar la foto del usuario (subir / mover / escalar). */
  onPhotoChange?: () => void;
}

const ProcessingCanvas = forwardRef<ProcessingCanvasHandle, ProcessingCanvasProps>(
  function ProcessingCanvas(
    { aspectRatio, fabricJson, onReady, onError, onWarning, onPhotoChange },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const onPhotoChangeRef = useRef(onPhotoChange);
    const onErrorRef = useRef(onError);
    const onWarningRef = useRef(onWarning);
    const onReadyRef = useRef(onReady);
    const fabricJsonKey = JSON.stringify(fabricJson);
    const { displayWidth, displayHeight } = getCanvasDimensions(aspectRatio);

    useEffect(() => {
      onPhotoChangeRef.current = onPhotoChange;
      onErrorRef.current = onError;
      onWarningRef.current = onWarning;
      onReadyRef.current = onReady;
    });

    function applyStyleObjectSettings(canvas: Canvas) {
      applyHighQualityToAllObjects(canvas.getObjects());
      canvas.getObjects().forEach((obj) => {
        obj.set({ selectable: false, evented: false });
      });
    }

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,

      getExportMultiplier: () => {
        const c = fabricRef.current;
        if (!c) return 1;
        const photo = findUserPhoto(c.getObjects());
        if (!photo) return 1;
        const scale = Math.max(photo.scaleX ?? 1, photo.scaleY ?? 1);
        return calcPhotoExportMultiplier(scale, displayWidth, displayHeight);
      },

      exportImage: () => {
        const c = fabricRef.current;
        if (!c) return null;

        const photo = findUserPhoto(c.getObjects());
        const scale = photo
          ? Math.max(photo.scaleX ?? 1, photo.scaleY ?? 1)
          : 1;
        const multiplier = calcPhotoExportMultiplier(
          scale,
          displayWidth,
          displayHeight,
        );

        // Renderizar a resolución nativa de la foto; PNG evita pérdida JPEG.
        const exportCanvas = c.toCanvasElement(multiplier);
        const ctx = exportCanvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
        }

        return exportCanvas.toDataURL("image/png");
      },

      setUserPhoto: async (source: string | File) => {
        const c = fabricRef.current;
        if (!c) return;

        const existing = c.getObjects().find(
          (o) => (o as FabricObject & { name?: string }).name === "user-photo",
        );
        if (existing) c.remove(existing);

        const img =
          typeof source === "string"
            ? await loadFabricImageFromUrl(source)
            : await loadFabricImageFromFile(source);

        const el = img.getElement() as HTMLImageElement;
        const nativeW = el?.naturalWidth || img.width || 1;
        const nativeH = el?.naturalHeight || img.height || 1;

        const scaleX = displayWidth / nativeW;
        const scaleY = displayHeight / nativeH;
        const scale = Math.max(scaleX, scaleY);

        img.set({
          name: "user-photo",
          scaleX: scale,
          scaleY: scale,
          originX: "center",
          originY: "center",
          left: displayWidth / 2,
          top: displayHeight / 2,
          selectable: true,
          evented: true,
          hasBorders: true,
          hasControls: true,
          objectCaching: false,
          minimumScaleTrigger: 0,
          imageSmoothing: true,
          noScaleCache: true,
        } as object);

        applyHighQualityObjectSettings(img);

        c.insertAt(0, img);
        c.setActiveObject(img);
        c.renderAll();
        onPhotoChangeRef.current?.();
      },
    }));

    useEffect(() => {
      initFabricCustomProperties();

      const container = containerRef.current;
      if (!container) return;

      const canvasEl = document.createElement("canvas");
      container.appendChild(canvasEl);

      let disposed = false;
      let canvas: Canvas | null = null;

      async function init() {
        const { Canvas: FabricCanvas } = await import("fabric");
        if (disposed) return;

        canvas = new FabricCanvas(canvasEl, {
          width: displayWidth,
          height: displayHeight,
          backgroundColor: "#1a1a1a",
          preserveObjectStacking: true,
          imageSmoothingEnabled: true,
          // Vista previa nítida en pantallas retina (el lienzo lógico sigue en 600px).
          enableRetinaScaling: true,
        });

        applyCanvasRenderQuality(canvas);
        fabricRef.current = canvas;

        const staleBlobs = countStaleBlobImages(fabricJson);
        const safeJson = sanitizeFabricJson(fabricJson);

        try {
          await canvas.loadFromJSON(safeJson);
        } catch (error) {
          if (!disposed) console.error("ProcessingCanvas: error al cargar JSON", error);
          onErrorRef.current?.(
            "No se pudo cargar el diseño del estilo. Volvé al editor y guardá de nuevo.",
          );
          return;
        }
        if (disposed) return;

        if (staleBlobs > 0) {
          onWarningRef.current?.(
            "Algunas imágenes del estilo no se guardaron correctamente. Abrí el editor, volvé a agregar las imágenes y guardá el estilo.",
          );
        }

        const objects = canvas.getObjects();
        if (objects.length === 0) {
          onErrorRef.current?.(
            "Este estilo no tiene elementos de diseño. Editá el estilo para agregar texto, formas o degradados.",
          );
        }

        rehydrateGradientLayers(canvas);
        applyStyleObjectSettings(canvas);
        canvas.discardActiveObject();
        canvas.renderAll();

        // Notificar al cliente cuando el usuario mueve / escala / rota la foto.
        const handlePhotoMutated = (opt: { target?: FabricObject }) => {
          const target = opt.target as (FabricObject & { name?: string }) | undefined;
          if (target?.name === "user-photo") onPhotoChangeRef.current?.();
        };
        canvas.on("object:modified", handlePhotoMutated);

        onReadyRef.current?.();
      }

      void init();

      return () => {
        disposed = true;
        canvas?.dispose();
        fabricRef.current = null;
        canvasEl.remove();
      };
    }, [fabricJsonKey, displayWidth, displayHeight]);

    return (
      <div
        ref={containerRef}
        className="inline-block overflow-hidden rounded-lg border border-border shadow-lg"
      />
    );
  },
);

export default ProcessingCanvas;
