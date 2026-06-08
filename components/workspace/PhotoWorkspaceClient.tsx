"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FabricObject } from "fabric";
import dynamic from "next/dynamic";
import { ImageUploader } from "@/components/workspace/ImageUploader";
import { Button } from "@/components/ui/button";
import type { ProcessingCanvasHandle } from "@/components/workspace/ProcessingCanvas";
import { getCanvasDimensions } from "@/lib/canvas-config";
import { getExportDimensions, getImageNaturalSize } from "@/lib/image-export";
import { WORKSPACE_CONTROLS_WIDTH } from "@/lib/layout";
import { ASPECT_RATIOS, WORKSPACE_QUICK_TEXT_COLORS } from "@/lib/constants";
import type { Style } from "@/types";
import { Download, Type } from "lucide-react";
import { LoaderCenter } from "@/components/ui/loader";
import { GlassPageHeader } from "@/components/layout/GlassPageHeader";
import { WorkspacePhotoTag } from "@/components/workspace/WorkspacePhotoTag";
import { WorkspaceTextColorSwatches } from "@/components/workspace/WorkspaceTextColorSwatches";
import { WorkspaceTextFontPicker } from "@/components/workspace/WorkspaceTextFontPicker";
import { isUserText } from "@/lib/fabric-utils";
import { cn } from "@/lib/utils";
import type { UserTextPickerPosition } from "@/lib/workspace-text";

const ProcessingCanvas = dynamic(
  () => import("@/components/workspace/ProcessingCanvas"),
  {
    ssr: false,
    loading: () => <LoaderCenter className="h-[400px] w-full" />,
  },
);

interface PhotoWorkspaceClientProps {
  codeId: string;
  style: Style;
}

export function PhotoWorkspaceClient({ codeId, style }: PhotoWorkspaceClientProps) {
  const canvasRef = useRef<ProcessingCanvasHandle>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [exportMultiplier, setExportMultiplier] = useState(1);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [canvasWarning, setCanvasWarning] = useState<string | null>(null);
  const [userTextCount, setUserTextCount] = useState(0);
  const [activeTextColor, setActiveTextColor] = useState<string | undefined>();
  const [fontPicker, setFontPicker] = useState<{
    position: UserTextPickerPosition;
    activeFont: string;
  } | null>(null);
  const hoveredTextRef = useRef<(FabricObject & { fontFamily?: string }) | null>(null);
  const hideFontPickerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { displayWidth, displayHeight } = getCanvasDimensions(style.aspect_ratio);
  const exportDims = getExportDimensions(displayWidth, displayHeight, exportMultiplier);
  const canDownload = hasPhoto && !canvasError;

  const handleDownload = useCallback(() => {
    const dataUrl = canvasRef.current?.exportImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `alpic-${style.name}-${Date.now()}.png`;
    a.click();
  }, [style.name]);

  const refreshExportMultiplier = useCallback(() => {
    setExportMultiplier(canvasRef.current?.getExportMultiplier() ?? 1);
  }, []);

  const handleClearPhoto = useCallback(() => {
    if (!canvasRef.current?.clearUserPhoto()) return;
    setHasPhoto(false);
    refreshExportMultiplier();
  }, [refreshExportMultiplier]);

  const clearHideFontPickerTimeout = useCallback(() => {
    if (hideFontPickerTimeoutRef.current) {
      clearTimeout(hideFontPickerTimeoutRef.current);
      hideFontPickerTimeoutRef.current = null;
    }
  }, []);

  const scheduleHideFontPicker = useCallback(() => {
    clearHideFontPickerTimeout();
    hideFontPickerTimeoutRef.current = setTimeout(() => {
      hoveredTextRef.current = null;
      setFontPicker(null);
    }, 160);
  }, [clearHideFontPickerTimeout]);

  const handleUserTextHover = useCallback(
    (
      obj: (FabricObject & { fontFamily?: string }) | null,
      position: UserTextPickerPosition | null,
    ) => {
      if (!obj || !position) {
        scheduleHideFontPicker();
        return;
      }

      clearHideFontPickerTimeout();
      hoveredTextRef.current = obj;
      setFontPicker({
        position,
        activeFont: obj.fontFamily ?? "Elms Sans",
      });
    },
    [clearHideFontPickerTimeout, scheduleHideFontPicker],
  );

  const handleSelectColor = useCallback((color: string) => {
    if (canvasRef.current?.applyColorToUserText(color)) {
      setActiveTextColor(color);
    }
  }, []);

  const handleUserTextSelectionChange = useCallback(
    (obj: (FabricObject & { fill?: string | object }) | null) => {
      if (!obj || typeof obj.fill !== "string") {
        setActiveTextColor(undefined);
        return;
      }
      setActiveTextColor(obj.fill);
    },
    [],
  );

  const handleSelectFont = useCallback((font: string) => {
    const obj = hoveredTextRef.current;
    if (!obj || !isUserText(obj)) return;

    obj.set({ fontFamily: font });
    obj.canvas?.renderAll();
    setFontPicker((current) => (current ? { ...current, activeFont: font } : current));
  }, []);

  useEffect(() => {
    if (!hasPhoto) return;

    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      const editingText = canvasRef.current
        ?.getCanvas()
        ?.getActiveObject() as { isEditing?: boolean } | undefined;
      if (isTypingTarget(e.target) || editingText?.isEditing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (canvasRef.current?.deleteSelectedUserText()) {
          e.preventDefault();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPhoto]);

  useEffect(() => () => clearHideFontPickerTimeout(), [clearHideFontPickerTimeout]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <GlassPageHeader
        backHref={`/estilos/${codeId}`}
        backLabel="← Estilos"
        leftActions={
          hasPhoto ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="liquid-glass-btn glass-header-action"
                onClick={() => canvasRef.current?.addText()}
              >
                <Type className="h-4 w-4" />
                Agregar texto
              </button>
              <WorkspaceTextColorSwatches
                visible={userTextCount > 0}
                colors={WORKSPACE_QUICK_TEXT_COLORS}
                activeColor={activeTextColor}
                onSelectColor={handleSelectColor}
              />
            </div>
          ) : null
        }
        title={style.name}
        subtitle={`${style.aspect_ratio} — ${ASPECT_RATIOS[style.aspect_ratio].label}`}
      />
      <div
        className="grid min-h-0 flex-1 overflow-hidden"
        style={{ gridTemplateColumns: `${WORKSPACE_CONTROLS_WIDTH}px 1fr` }}
      >
        <div className="panel-scroll space-y-6 overflow-y-auto p-6">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
              Imagen
            </p>
            <div className="grid grid-cols-[minmax(0,1fr)_3rem] gap-2">
              <ImageUploader
                className="min-w-0"
                onUpload={async (file) => {
                  const url = URL.createObjectURL(file);
                  const dims = await getImageNaturalSize(url);
                  URL.revokeObjectURL(url);

                  await canvasRef.current?.setUserPhoto(file);
                  refreshExportMultiplier();
                  setHasPhoto(dims.w > 0);
                }}
              />
              <Button
                type="button"
                variant={canDownload ? "default" : "secondary"}
                className={cn(
                  "!h-full w-full rounded-xl p-0 transition-colors duration-300",
                  canDownload
                    ? "bg-primary text-white hover:bg-primary-hover"
                    : "liquid-glass-btn",
                )}
                disabled={!canDownload}
                onClick={handleDownload}
                title={`Descargar ${style.name}`}
                aria-label={`Descargar ${style.name}`}
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
            {hasPhoto ? (
              <WorkspacePhotoTag
                width={exportDims.width}
                height={exportDims.height}
                onRemove={handleClearPhoto}
              />
            ) : null}
          </div>
        </div>

        <div className="panel-scroll flex flex-col items-center justify-center gap-4 overflow-auto bg-background p-8">
          {canvasError ? (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-danger">
              {canvasError}
            </div>
          ) : (
            <>
              {canvasWarning ? (
                <div className="max-w-lg rounded-lg border border-accent/30 bg-accent-muted p-4 text-center text-sm text-foreground">
                  {canvasWarning}
                </div>
              ) : null}
              <div className="relative">
                <ProcessingCanvas
                  key={`${style.id}-${style.updated_at}`}
                  ref={canvasRef}
                  aspectRatio={style.aspect_ratio}
                  fabricJson={style.fabric_json}
                  onError={setCanvasError}
                  onWarning={setCanvasWarning}
                  onPhotoChange={refreshExportMultiplier}
                  onUserTextHover={handleUserTextHover}
                  onUserTextCountChange={setUserTextCount}
                  onUserTextSelectionChange={handleUserTextSelectionChange}
                />
                {fontPicker ? (
                  <WorkspaceTextFontPicker
                    position={fontPicker.position}
                    activeFont={fontPicker.activeFont}
                    onSelectFont={handleSelectFont}
                    onPointerEnter={clearHideFontPickerTimeout}
                    onPointerLeave={scheduleHideFontPicker}
                  />
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
