"use client";

import { type Canvas, type FabricObject, Point } from "fabric";
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignCenterHorizontal,
  AlignCenterVertical,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AlignmentBarProps {
  canvas: Canvas | null;
  selectedObject: FabricObject | undefined;
  canvasWidth: number;
  canvasHeight: number;
  onModified: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function applyCanvasZoom(canvas: Canvas, zoom: number) {
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  const center = new Point(canvas.width / 2, canvas.height / 2);
  canvas.zoomToPoint(center, clamped);
  canvas.requestRenderAll();
  return clamped;
}

function alignObject(
  canvas: Canvas,
  obj: FabricObject,
  canvasW: number,
  canvasH: number,
  action: string,
) {
  const bb = obj.getBoundingRect();
  let dx = 0;
  let dy = 0;

  switch (action) {
    case "left":
      dx = -bb.left;
      break;
    case "center-h":
      dx = canvasW / 2 - (bb.left + bb.width / 2);
      break;
    case "right":
      dx = canvasW - (bb.left + bb.width);
      break;
    case "top":
      dy = -bb.top;
      break;
    case "center-v":
      dy = canvasH / 2 - (bb.top + bb.height / 2);
      break;
    case "bottom":
      dy = canvasH - (bb.top + bb.height);
      break;
    case "center":
      dx = canvasW / 2 - (bb.left + bb.width / 2);
      dy = canvasH / 2 - (bb.top + bb.height / 2);
      break;
  }

  const current = obj.getCenterPoint();
  obj.setPositionByOrigin(
    new Point(current.x + dx, current.y + dy),
    "center",
    "center",
  );
  obj.setCoords();
  canvas.renderAll();
}

interface AlignBtnProps {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}

function AlignBtn({ title, onClick, children }: AlignBtnProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={title}
      className="h-7 w-7 text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function AlignmentBar({
  canvas,
  selectedObject,
  canvasWidth,
  canvasHeight,
  onModified,
  zoom,
  onZoomChange,
}: AlignmentBarProps) {
  const hasSelection = !!canvas && !!selectedObject;

  function align(action: string) {
    if (!canvas || !selectedObject) return;
    alignObject(canvas, selectedObject, canvasWidth, canvasHeight, action);
    onModified();
  }

  function changeZoom(next: number) {
    if (!canvas) return;
    const applied = applyCanvasZoom(canvas, next);
    onZoomChange(applied);
  }

  function zoomBy(delta: number) {
    changeZoom(zoom + delta);
  }

  return (
    <div className="relative flex h-9 shrink-0 items-center justify-center border-t border-border bg-surface px-4">
      <div
        className={cn(
          "flex items-center gap-0.5 transition-[opacity,transform] duration-200 ease-out",
          hasSelection
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
      {/* Alineación horizontal */}
      <AlignBtn title="Alinear a la izquierda" onClick={() => align("left")}>
        <AlignHorizontalJustifyStart className="h-3.5 w-3.5" />
      </AlignBtn>
      <AlignBtn title="Centrar horizontalmente" onClick={() => align("center-h")}>
        <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />
      </AlignBtn>
      <AlignBtn title="Alinear a la derecha" onClick={() => align("right")}>
        <AlignHorizontalJustifyEnd className="h-3.5 w-3.5" />
      </AlignBtn>

      <Separator orientation="vertical" className="mx-1.5 h-4" />

      {/* Alineación vertical */}
      <AlignBtn title="Alinear arriba" onClick={() => align("top")}>
        <AlignVerticalJustifyStart className="h-3.5 w-3.5" />
      </AlignBtn>
      <AlignBtn title="Centrar verticalmente" onClick={() => align("center-v")}>
        <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
      </AlignBtn>
      <AlignBtn title="Alinear abajo" onClick={() => align("bottom")}>
        <AlignVerticalJustifyEnd className="h-3.5 w-3.5" />
      </AlignBtn>

      <Separator orientation="vertical" className="mx-1.5 h-4" />

      {/* Centrado total */}
      <AlignBtn title="Centrar en el canvas" onClick={() => align("center")}>
        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
          <AlignCenterHorizontal className="absolute h-3 w-3 translate-y-[-3px]" />
          <AlignCenterVertical className="absolute h-3 w-3 translate-y-[3px]" />
        </span>
      </AlignBtn>
      </div>

      <div className="absolute right-4 flex items-center gap-0.5">
        <AlignBtn
          title="Alejar"
          onClick={() => zoomBy(-ZOOM_STEP)}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </AlignBtn>
        <button
          type="button"
          title="Restablecer zoom"
          className="min-w-12 px-1 text-xs tabular-nums text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          disabled={!canvas}
          onClick={() => changeZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <AlignBtn
          title="Acercar"
          onClick={() => zoomBy(ZOOM_STEP)}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </AlignBtn>
      </div>
    </div>
  );
}
