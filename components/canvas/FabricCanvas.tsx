"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Canvas, Point, type FabricObject, type TPointerEvent } from "fabric";
import { type Rect } from "fabric";
import {
  FABRIC_SERIALIZE_PROPS,
  ensureObjectIds,
  initFabricCustomProperties,
  isGradientLayer,
  rehydrateGradientLayers,
  sanitizeFabricJson,
  syncGradientLayerTransform,
} from "@/lib/fabric-utils";
import { shouldSnapRotation, snapRotationAngle } from "@/lib/rotation-utils";
import {
  applyCanvasRenderQuality,
  applyHighQualityToAllObjects,
  loadFabricImageFromUrl,
} from "@/lib/image-export";

const MAX_HISTORY = 50;

export interface FabricCanvasHandle {
  getCanvas: () => Canvas | null;
  undo: () => void;
  redo: () => void;
  deleteActive: () => void;
}

interface FabricCanvasProps {
  width: number;
  height: number;
  fabricJson?: object;
  /** URL de imagen para mostrar como fondo bloqueado (no se serializa). */
  backgroundImageSrc?: string;
  readOnly?: boolean;
  onReady?: (canvas: Canvas) => void;
  onSelectionChange?: (obj: FabricObject | undefined) => void;
  onModified?: () => void;
  onLiveModified?: () => void;
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
  onZoomChange?: (zoom: number) => void;
}

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
  function FabricCanvas(
    {
      width,
      height,
      fabricJson,
      backgroundImageSrc,
      readOnly = false,
      onReady,
      onSelectionChange,
      onModified,
      onLiveModified,
      onHistoryChange,
      onZoomChange,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const initialJsonRef = useRef(fabricJson);

    const onReadyRef = useRef(onReady);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const onModifiedRef = useRef(onModified);
    const onLiveModifiedRef = useRef(onLiveModified);
    const onHistoryChangeRef = useRef(onHistoryChange);
    const onZoomChangeRef = useRef(onZoomChange);

    // Historial de deshacer/rehacer
    const historyRef = useRef<object[]>([]);
    const pointerRef = useRef(-1);
    const loadedRef = useRef(false);
    const restoringRef = useRef(false);
    const batchingRef = useRef(false);

    useEffect(() => {
      onReadyRef.current = onReady;
      onSelectionChangeRef.current = onSelectionChange;
      onModifiedRef.current = onModified;
      onLiveModifiedRef.current = onLiveModified;
      onHistoryChangeRef.current = onHistoryChange;
      onZoomChangeRef.current = onZoomChange;
    });

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      undo: () => undoRef.current(),
      redo: () => redoRef.current(),
      deleteActive: () => deleteActiveRef.current(),
    }));

    // Refs a las funciones imperativas (se asignan dentro del efecto principal)
    const undoRef = useRef<() => void>(() => {});
    const redoRef = useRef<() => void>(() => {});
    const deleteActiveRef = useRef<() => void>(() => {});

    useEffect(() => {
      initFabricCustomProperties();

      const container = containerRef.current;
      if (!container) return;

      const canvasEl = document.createElement("canvas");
      container.appendChild(canvasEl);

      const canvas = new Canvas(canvasEl, {
        width,
        height,
        backgroundColor: "#1a1a1a",
        selection: !readOnly,
        preserveObjectStacking: true,
        imageSmoothingEnabled: true,
        enableRetinaScaling: true,
      });

      applyCanvasRenderQuality(canvas);
      fabricRef.current = canvas;

      let disposed = false;

      // ─── Pan con Space + zoom con teclado ────────────────────────────────────
      const PAN_MIN_ZOOM = 0.25;
      const PAN_MAX_ZOOM = 3;
      const PAN_ZOOM_STEP = 0.25;

      let isPanning = false;
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;

      const upperEl = canvas.upperCanvasEl as HTMLCanvasElement;

      const onPointerDownPan = (e: PointerEvent) => {
        if (!isPanning) return;
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        upperEl.setPointerCapture(e.pointerId);
        canvas.setCursor("grabbing");
        e.stopImmediatePropagation();
        e.preventDefault();
      };

      const onPointerMovePan = (e: PointerEvent) => {
        if (!isPanning || !isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.relativePan(new Point(dx, dy));
        e.stopImmediatePropagation();
      };

      const onPointerUpPan = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        canvas.setCursor("grab");
        e.stopImmediatePropagation();
      };

      upperEl.addEventListener("pointerdown", onPointerDownPan, { capture: true });
      upperEl.addEventListener("pointermove", onPointerMovePan, { capture: true });
      upperEl.addEventListener("pointerup", onPointerUpPan, { capture: true });

      const onKeyDown = (e: KeyboardEvent) => {
        if (disposed) return;
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        if (e.code === "Space") {
          e.preventDefault();
          if (!isPanning) {
            isPanning = true;
            canvas.defaultCursor = "grab";
            canvas.setCursor("grab");
          }
        }

        if (e.code === "KeyZ" && !e.metaKey && !e.ctrlKey) {
          const next = Math.min(
            PAN_MAX_ZOOM,
            Math.max(PAN_MIN_ZOOM, canvas.getZoom() + (e.altKey ? -PAN_ZOOM_STEP : PAN_ZOOM_STEP)),
          );
          const center = new Point(canvas.width / 2, canvas.height / 2);
          canvas.zoomToPoint(center, next);
          canvas.requestRenderAll();
          onZoomChangeRef.current?.(next);
        }
      };

      const onKeyUp = (e: KeyboardEvent) => {
        if (e.code === "Space") {
          isPanning = false;
          isDragging = false;
          canvas.defaultCursor = "default";
          canvas.setCursor("default");
        }
      };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      // ─────────────────────────────────────────────────────────────────────────

      const notifyHistory = () => {
        onHistoryChangeRef.current?.({
          canUndo: pointerRef.current > 0,
          canRedo: pointerRef.current < historyRef.current.length - 1,
        });
      };

      const snapshot = (): object =>
        canvas.toObject([...FABRIC_SERIALIZE_PROPS]) as object;

      const saveSnapshot = () => {
        if (restoringRef.current || batchingRef.current || !loadedRef.current) return;
        const next = snapshot();
        const history = historyRef.current.slice(0, pointerRef.current + 1);
        history.push(next);
        if (history.length > MAX_HISTORY) history.shift();
        historyRef.current = history;
        pointerRef.current = history.length - 1;
        notifyHistory();
      };

      const restore = async (state: object) => {
        restoringRef.current = true;
        try {
          await canvas.loadFromJSON(state);
          if (disposed) return;
          ensureObjectIds(canvas);
          rehydrateGradientLayers(canvas);
          applyHighQualityToAllObjects(canvas.getObjects());
          canvas.discardActiveObject();
          canvas.renderAll();
        } finally {
          restoringRef.current = false;
        }
        onSelectionChangeRef.current?.(undefined);
        onModifiedRef.current?.();
      };

      undoRef.current = () => {
        if (pointerRef.current <= 0) return;
        pointerRef.current -= 1;
        notifyHistory();
        void restore(historyRef.current[pointerRef.current]);
      };

      redoRef.current = () => {
        if (pointerRef.current >= historyRef.current.length - 1) return;
        pointerRef.current += 1;
        notifyHistory();
        void restore(historyRef.current[pointerRef.current]);
      };

      deleteActiveRef.current = () => {
        const targets = canvas.getActiveObjects();
        if (targets.length === 0) return;
        const removable = targets;
        if (removable.length === 0) return;

        batchingRef.current = true;
        removable.forEach((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        batchingRef.current = false;

        saveSnapshot();
        onSelectionChangeRef.current?.(undefined);
        onModifiedRef.current?.();
      };

      const handleSelection = () => {
        if (disposed) return;
        onSelectionChangeRef.current?.(canvas.getActiveObject());
      };

      // Fires on every frame during drag — solo para actualizar el panel de propiedades.
      const handleLive = () => {
        if (disposed) return;
        onLiveModifiedRef.current?.();
      };

      const handleRotating = (opt: { e?: TPointerEvent; transform?: { target: FabricObject } }) => {
        if (disposed) return;
        const obj = opt.transform?.target;
        if (obj && shouldSnapRotation(opt.e)) {
          const snapped = snapRotationAngle(obj.angle ?? 0);
          if (snapped !== obj.angle) {
            // Preservar el centro para rotar en el lugar (sin desplazar el objeto).
            const center = obj.getCenterPoint();
            obj.set({ angle: snapped });
            obj.setPositionByOrigin(center, "center", "center");
            obj.setCoords();
            canvas.requestRenderAll();
          }
        }
        // Solo actualización visual en vivo, no guarda historial aquí.
        onLiveModifiedRef.current?.();
      };

      const handleModified = () => {
        if (disposed || !loadedRef.current || restoringRef.current) return;
        const active = canvas.getActiveObject();
        if (active && isGradientLayer(active)) {
          syncGradientLayerTransform(active as Rect);
          canvas.renderAll();
        }
        saveSnapshot();
        onModifiedRef.current?.();
        // Forzar re-render del panel tras soltar.
        onLiveModifiedRef.current?.();
      };

      const handleStructureChange = () => {
        if (disposed || !loadedRef.current || restoringRef.current) return;
        ensureObjectIds(canvas);
        applyHighQualityToAllObjects(canvas.getObjects());
        saveSnapshot();
        onModifiedRef.current?.();
        onLiveModifiedRef.current?.();
      };

      const handleSelectionCleared = () => {
        onSelectionChangeRef.current?.(undefined);
      };

      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", handleSelectionCleared);
      canvas.on("object:moving", handleLive);
      canvas.on("object:scaling", handleLive);
      canvas.on("object:skewing", handleLive);
      canvas.on("object:rotating", handleRotating);
      canvas.on("object:modified", handleModified);
      canvas.on("object:added", handleStructureChange);
      canvas.on("object:removed", handleStructureChange);

      const loadCanvas = async () => {
        const json = initialJsonRef.current;

        try {
          if (disposed) return;

          if (json && Object.keys(json).length > 0) {
            await canvas.loadFromJSON(sanitizeFabricJson(json));
          }
        } catch (error) {
          if (!disposed) {
            console.error("FabricCanvas: error al cargar JSON", error);
          }
          return;
        }

        if (disposed) return;

        // Cargar imagen de fondo (ejemplo en editor, foto de usuario en workspace).
        if (backgroundImageSrc) {
          try {
            const img = await loadFabricImageFromUrl(backgroundImageSrc);
            if (!disposed) {
              // Escalar para cubrir todo el canvas (cover).
              const scaleX = width / (img.width ?? 1);
              const scaleY = height / (img.height ?? 1);
              const scale = Math.max(scaleX, scaleY);
              img.set({
                scaleX: scale,
                scaleY: scale,
                originX: "center",
                originY: "center",
                left: width / 2,
                top: height / 2,
                selectable: false,
                evented: false,
              });
              canvas.backgroundImage = img;
            }
          } catch (err) {
            if (!disposed) console.error("FabricCanvas: error al cargar fondo", err);
          }
        }

        if (disposed) return;

        ensureObjectIds(canvas);
        rehydrateGradientLayers(canvas);
        applyHighQualityToAllObjects(canvas.getObjects());

        if (readOnly) {
          canvas.getObjects().forEach((obj) => {
            obj.set({ selectable: false, evented: false });
          });
          canvas.selection = false;
        }

        canvas.renderAll();

        // Establecer línea base del historial sin marcar como modificado
        loadedRef.current = true;
        historyRef.current = [snapshot()];
        pointerRef.current = 0;
        notifyHistory();

        onReadyRef.current?.(canvas);
      };

      void loadCanvas();

      return () => {
        disposed = true;
        loadedRef.current = false;
        canvas.off("selection:created", handleSelection);
        canvas.off("selection:updated", handleSelection);
        canvas.off("selection:cleared", handleSelectionCleared);
        canvas.off("object:moving", handleLive);
        canvas.off("object:scaling", handleLive);
        canvas.off("object:skewing", handleLive);
        canvas.off("object:rotating", handleRotating);
        canvas.off("object:modified", handleModified);
        canvas.off("object:added", handleStructureChange);
        canvas.off("object:removed", handleStructureChange);
        canvas.dispose();
        fabricRef.current = null;
        historyRef.current = [];
        pointerRef.current = -1;
        canvasEl.remove();
        upperEl.removeEventListener("pointerdown", onPointerDownPan, { capture: true });
        upperEl.removeEventListener("pointermove", onPointerMovePan, { capture: true });
        upperEl.removeEventListener("pointerup", onPointerUpPan, { capture: true });
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      };
      // Solo reinicializar si cambian dimensiones, modo lectura o imagen de fondo — nunca por callbacks
    }, [width, height, readOnly, backgroundImageSrc]);

    return (
      <div
        ref={containerRef}
        className="inline-block overflow-hidden rounded-lg border border-border shadow-lg"
      />
    );
  },
);

export default FabricCanvas;
