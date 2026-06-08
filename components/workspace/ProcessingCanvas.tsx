"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Canvas, type FabricObject } from "fabric";
import {
  addTextToCanvas,
  countStaleBlobImages,
  initFabricCustomProperties,
  isUserPhoto,
  isUserText,
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
import {
  countUserTexts,
  getUserTextPickerPosition,
  type UserTextPickerPosition,
} from "@/lib/workspace-text";

export interface ProcessingCanvasHandle {
  getCanvas: () => Canvas | null;
  exportImage: () => string | null;
  getExportMultiplier: () => number;
  setUserPhoto: (source: string | File) => Promise<void>;
  addText: () => void;
  deleteSelectedUserText: () => boolean;
  applyColorToUserText: (color: string) => boolean;
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
  /** Hover sobre un texto agregado por el usuario en workspace. */
  onUserTextHover?: (
    obj: (FabricObject & { fontFamily?: string }) | null,
    position: UserTextPickerPosition | null,
  ) => void;
  onUserTextCountChange?: (count: number) => void;
  onUserTextSelectionChange?: (
    obj: (FabricObject & { fill?: string | object }) | null,
  ) => void;
}

const ProcessingCanvas = forwardRef<ProcessingCanvasHandle, ProcessingCanvasProps>(
  function ProcessingCanvas(
    {
      aspectRatio,
      fabricJson,
      onReady,
      onError,
      onWarning,
      onPhotoChange,
      onUserTextHover,
      onUserTextCountChange,
      onUserTextSelectionChange,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const hoveredUserTextRef = useRef<FabricObject | null>(null);
    const onPhotoChangeRef = useRef(onPhotoChange);
    const onErrorRef = useRef(onError);
    const onWarningRef = useRef(onWarning);
    const onReadyRef = useRef(onReady);
    const onUserTextHoverRef = useRef(onUserTextHover);
    const onUserTextCountChangeRef = useRef(onUserTextCountChange);
    const onUserTextSelectionChangeRef = useRef(onUserTextSelectionChange);
    const fabricJsonKey = JSON.stringify(fabricJson);
    const { displayWidth, displayHeight } = getCanvasDimensions(aspectRatio);

    useEffect(() => {
      onPhotoChangeRef.current = onPhotoChange;
      onErrorRef.current = onError;
      onWarningRef.current = onWarning;
      onReadyRef.current = onReady;
      onUserTextHoverRef.current = onUserTextHover;
      onUserTextCountChangeRef.current = onUserTextCountChange;
      onUserTextSelectionChangeRef.current = onUserTextSelectionChange;
    });

    function notifyUserTextCount() {
      const canvas = fabricRef.current;
      if (!canvas) return;
      onUserTextCountChangeRef.current?.(countUserTexts(canvas));
    }

    function notifyUserTextSelection(obj: FabricObject | null | undefined) {
      if (!obj || !isUserText(obj)) {
        onUserTextSelectionChangeRef.current?.(null);
        return;
      }
      onUserTextSelectionChangeRef.current?.(
        obj as FabricObject & { fill?: string | object },
      );
    }

    function notifyUserTextHover(obj: FabricObject | null) {
      const canvas = fabricRef.current;
      if (!canvas || !obj || !isUserText(obj)) {
        hoveredUserTextRef.current = null;
        onUserTextHoverRef.current?.(null, null);
        return;
      }

      hoveredUserTextRef.current = obj;
      onUserTextHoverRef.current?.(
        obj as FabricObject & { fontFamily?: string },
        getUserTextPickerPosition(canvas, obj),
      );
    }

    function applyStyleObjectSettings(canvas: Canvas) {
      applyHighQualityToAllObjects(canvas.getObjects());
      canvas.getObjects().forEach((obj) => {
        if (isUserPhoto(obj) || isUserText(obj)) return;
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

      addText: () => {
        const c = fabricRef.current;
        if (!c) return;
        const text = addTextToCanvas(c, displayWidth, displayHeight, { name: "user-text" });
        notifyUserTextCount();
        notifyUserTextSelection(text);
      },

      deleteSelectedUserText: () => {
        const c = fabricRef.current;
        if (!c) return false;

        const active = c.getActiveObject();
        if (!active || !isUserText(active)) return false;

        c.remove(active);
        c.discardActiveObject();
        c.renderAll();
        notifyUserTextHover(null);
        notifyUserTextCount();
        notifyUserTextSelection(null);
        return true;
      },

      applyColorToUserText: (color: string) => {
        const c = fabricRef.current;
        if (!c) return false;

        const active = c.getActiveObject();
        const target =
          active && isUserText(active) ? active : hoveredUserTextRef.current;
        if (!target || !isUserText(target)) return false;

        target.set({ fill: color });
        c.renderAll();
        notifyUserTextSelection(target);
        return true;
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

        const handleUserTextHover = (opt: { target?: FabricObject }) => {
          const target = opt.target;
          if (!target || !isUserText(target)) return;
          const editing = target as FabricObject & { isEditing?: boolean };
          if (editing.isEditing) return;
          notifyUserTextHover(target);
        };

        const handleUserTextHoverOut = (opt: { target?: FabricObject }) => {
          if (opt.target !== hoveredUserTextRef.current) return;
          notifyUserTextHover(null);
        };

        const handleUserTextMoved = (opt: { target?: FabricObject }) => {
          if (opt.target !== hoveredUserTextRef.current) return;
          notifyUserTextHover(opt.target);
        };

        const handleUserTextSelection = () => {
          notifyUserTextSelection(canvas?.getActiveObject());
        };

        canvas.on("mouse:over", handleUserTextHover);
        canvas.on("mouse:out", handleUserTextHoverOut);
        canvas.on("object:moving", handleUserTextMoved);
        canvas.on("object:scaling", handleUserTextMoved);
        canvas.on("object:rotating", handleUserTextMoved);
        canvas.on("selection:created", handleUserTextSelection);
        canvas.on("selection:updated", handleUserTextSelection);
        canvas.on("selection:cleared", () => notifyUserTextSelection(null));

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
