"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Undo2, Redo2, ChevronDown } from "lucide-react";
import { AlignmentBar } from "@/components/canvas/AlignmentBar";
import { type Canvas, type FabricObject } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { LayerPanel } from "@/components/canvas/LayerPanel";
import { PropertiesPanel } from "@/components/canvas/PropertiesPanel";
import type { FabricCanvasHandle } from "@/components/canvas/FabricCanvas";
import { estimateJsonSize } from "@/lib/canvas-config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASPECT_RATIOS } from "@/lib/constants";
import {
  generateThumbnail,
  getCanvasDimensions,
  serializeCanvas,
} from "@/lib/fabric-utils";
import type { AspectRatio, Style } from "@/types";
import { LoaderCenter } from "@/components/ui/loader";
import { toast } from "sonner";
import { storeLatestSavedStyle } from "@/lib/style-update-store";
import { saveLocalStyle } from "@/lib/local-styles";
const FabricCanvas = dynamic(() => import("@/components/canvas/FabricCanvas"), {
  ssr: false,
  loading: () => <LoaderCenter className="h-[400px] w-full" />,
});

interface EditorClientProps {
  codeId: string;
  styleId: string;
  initialStyle: Style;
}

export function EditorClient({ codeId, styleId, initialStyle }: EditorClientProps) {
  const router = useRouter();
  const canvasRef = useRef<FabricCanvasHandle>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [styleName, setStyleName] = useState(initialStyle.name);
  const [selectedObject, setSelectedObject] = useState<FabricObject | undefined>();
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  // Contador que fuerza re-render del panel de propiedades durante el drag.
  const [liveUpdateTick, setLiveUpdateTick] = useState(0);
  const [zoom, setZoom] = useState(1);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialStyle.aspect_ratio as AspectRatio);
  const { displayWidth, displayHeight } = getCanvasDimensions(aspectRatio);

  const refreshObjects = useCallback((c: Canvas | null) => {
    if (c) setObjects([...c.getObjects()]);
  }, []);

  const handleModified = useCallback(() => {
    setIsDirty(true);
    setLastSaved(false);
    refreshObjects(canvasRef.current?.getCanvas() ?? null);
  }, [refreshObjects]);

  const handleLiveModified = useCallback(() => {
    setLiveUpdateTick((t) => t + 1);
  }, []);

  const handleCanvasReady = useCallback(
    (c: Canvas) => {
      setCanvas(c);
      refreshObjects(c);
    },
    [refreshObjects],
  );

  const handleSelectionChange = useCallback((obj: FabricObject | undefined) => {
    setSelectedObject(obj);
  }, []);

  const handleSave = useCallback(async () => {
    const c = canvasRef.current?.getCanvas();
    if (!c) return;

    setSaving(true);
    try {
      const fabricJson = serializeCanvas(c);
      const jsonSize = estimateJsonSize(fabricJson);

      if (jsonSize > 5 * 1024 * 1024) {
        toast.warning(
          "El estilo supera 5MB. Considerá optimizar las imágenes antes de subirlas.",
        );
      }

      const thumbnail = generateThumbnail(c, displayWidth);

      const saved = saveLocalStyle(styleId, {
        name: styleName,
        fabric_json: fabricJson,
        thumbnail,
        aspect_ratio: aspectRatio,
      });
      storeLatestSavedStyle(saved);

      setIsDirty(false);
      setLastSaved(true);
      toast.success("Estilo guardado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el estilo");
    } finally {
      setSaving(false);
    }
  }, [styleId, styleName, aspectRatio, displayWidth]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
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
      const mod = e.metaKey || e.ctrlKey;

      // Guardar con Cmd/Ctrl+S siempre
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
        return;
      }

      // No interferir si se está escribiendo en un campo o editando texto en el canvas
      const editingText = canvasRef.current
        ?.getCanvas()
        ?.getActiveObject() as { isEditing?: boolean } | undefined;
      if (isTypingTarget(e.target) || editingText?.isEditing) return;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) canvasRef.current?.redo();
        else canvasRef.current?.undo();
        return;
      }

      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        canvasRef.current?.redo();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        canvasRef.current?.deleteActive();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-secondary px-6 text-secondary-foreground">
        <Button variant="ghost" size="sm" className="header-btn rounded-full" onClick={() => {
            router.refresh();
            router.push(`/estilos/${codeId}`);
          }}>
          <ArrowLeft className="h-4 w-4" />
          Estilos
        </Button>

        <div className="h-5 w-px bg-border" />

        <Input
          value={styleName}
          onChange={(e) => {
            setStyleName(e.target.value);
            setIsDirty(true);
          }}
          className="max-w-xs border-none bg-transparent text-base font-medium text-secondary-foreground placeholder:text-white/50 focus-visible:ring-0"
        />

        <Select
          value={aspectRatio}
          onValueChange={(v) => {
            setAspectRatio(v as AspectRatio);
            setIsDirty(true);
            setLastSaved(false);
          }}
        >
          <SelectTrigger className="header-btn h-8 w-auto gap-1 rounded-full px-3 py-0 text-xs text-white/80 shadow-none focus:ring-0">
            <SelectValue />
            <ChevronDown className="h-3 w-3 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                <span className="font-mono">{ratio}</span>
                <span className="ml-2 text-xs text-muted-foreground">{ASPECT_RATIOS[ratio].label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Deshacer (Ctrl+Z)"
              disabled={!history.canUndo}
              className="header-btn liquid-glass-btn-icon h-8 w-8"
              onClick={() => canvasRef.current?.undo()}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Rehacer (Ctrl+Shift+Z)"
              disabled={!history.canRedo}
              className="header-btn liquid-glass-btn-icon h-8 w-8"
              onClick={() => canvasRef.current?.redo()}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          {isDirty && !lastSaved && (
            <span className="text-xs text-warning">Cambios sin guardar</span>
          )}
          {lastSaved && !isDirty && (
            <span className="text-xs text-success">Guardado</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-primary text-white hover:bg-primary-hover"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </header>

      <div
        className="grid flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: "clamp(200px, 20vw, 260px) minmax(0, 1fr) clamp(220px, 23vw, 300px)",
        }}
      >
        <aside className="panel-scroll overflow-y-auto border-r border-border bg-surface p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            Herramientas
          </p>
          <CanvasToolbar
            canvas={canvas}
            canvasWidth={displayWidth}
            canvasHeight={displayHeight}
            onModified={handleModified}
          />
          <div className="my-4 border-t border-border" />
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Capas</p>
          <LayerPanel
            canvas={canvas}
            objects={objects}
            selectedObject={selectedObject}
            onModified={handleModified}
            onSelect={setSelectedObject}
          />
        </aside>

        <main className="panel-scroll flex items-center justify-center overflow-auto bg-background p-8">
          <FabricCanvas
            ref={canvasRef}
            width={displayWidth}
            height={displayHeight}
            fabricJson={initialStyle.fabric_json}
            backgroundImageSrc="/example-photo.jpg"
            onReady={handleCanvasReady}
            onSelectionChange={handleSelectionChange}
            onModified={handleModified}
            onLiveModified={handleLiveModified}
            onHistoryChange={setHistory}
            onZoomChange={setZoom}
          />
        </main>

        <aside className="panel-scroll overflow-y-auto border-l border-border bg-surface p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            Propiedades
          </p>
          <PropertiesPanel
            selectedObject={selectedObject}
            onModified={handleModified}
            liveUpdateTick={liveUpdateTick}
          />
        </aside>
      </div>

      <AlignmentBar
        canvas={canvas}
        selectedObject={selectedObject}
        canvasWidth={displayWidth}
        canvasHeight={displayHeight}
        onModified={handleModified}
        zoom={zoom}
        onZoomChange={setZoom}
      />
    </div>
  );
}
