"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2, Blend } from "lucide-react";
import { type Canvas, type FabricObject } from "fabric";
import { Button } from "@/components/ui/button";
import { getObjectId, isGradientLayer } from "@/lib/fabric-utils";

interface LayerPanelProps {
  canvas: Canvas | null;
  objects: FabricObject[];
  selectedObject?: FabricObject;
  onModified: () => void;
  onSelect: (obj: FabricObject) => void;
}

export function LayerPanel({
  canvas,
  objects,
  selectedObject,
  onModified,
  onSelect,
}: LayerPanelProps) {
  const reversed = [...objects].reverse();

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  function refresh() {
    canvas?.renderAll();
    onModified();
  }

  function toggleVisibility(obj: FabricObject) {
    obj.set({ visible: !obj.visible });
    refresh();
  }

  function removeObject(obj: FabricObject) {
    if (!canvas) return;
    canvas.remove(obj);
    refresh();
  }

  function handleDragStart(e: React.DragEvent, idx: number) {
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    // Imagen de arrastre semitransparente.
    e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 12, 12);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== draggingIdx) setOverIdx(idx);
  }

  function handleDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault();
    if (!canvas || draggingIdx === null || draggingIdx === targetIdx) {
      setDraggingIdx(null);
      setOverIdx(null);
      return;
    }

    // reversed[i] → canvas index = (n - 1 - i)
    const n = reversed.length;
    const obj = reversed[draggingIdx];
    const targetCanvasIdx = n - 1 - targetIdx;

    canvas.moveObjectTo(obj, targetCanvasIdx);
    canvas.renderAll();
    onModified();

    setDraggingIdx(null);
    setOverIdx(null);
  }

  function handleDragEnd() {
    setDraggingIdx(null);
    setOverIdx(null);
  }

  return (
    <div>
      <div className="space-y-0.5">
        {reversed.length === 0 && (
          <p className="text-xs text-muted">Sin capas</p>
        )}
        {reversed.map((obj, i) => {
          const isGradient = isGradientLayer(obj);
          const isSelected = selectedObject === obj;
          const isDragging = draggingIdx === i;
          const isOver = overIdx === i && draggingIdx !== null && draggingIdx !== i;

          const label =
            isGradient
              ? "Degradado"
              : obj.type === "i-text" || obj.type === "text"
              ? (obj as FabricObject & { text?: string }).text?.slice(0, 20) || "Texto"
              : obj.type === "image"
                ? "Imagen"
                : obj.type ?? "Objeto";

          return (
            <div
              key={getObjectId(obj)}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={() => setOverIdx(null)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={[
                "flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs transition-all",
                "cursor-grab active:cursor-grabbing select-none",
                isSelected ? "border-primary bg-primary-muted" : "border-border",
                isDragging ? "opacity-40" : "opacity-100",
                isOver ? "border-accent ring-1 ring-accent/60" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Icono de arrastre */}
              <span className="mr-0.5 shrink-0 text-muted">
                <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                  <circle cx="3" cy="3" r="1.2" />
                  <circle cx="7" cy="3" r="1.2" />
                  <circle cx="3" cy="7" r="1.2" />
                  <circle cx="7" cy="7" r="1.2" />
                  <circle cx="3" cy="11" r="1.2" />
                  <circle cx="7" cy="11" r="1.2" />
                </svg>
              </span>

              <button
                type="button"
                className="flex flex-1 items-center gap-1 truncate text-left"
                onClick={() => {
                  canvas?.setActiveObject(obj);
                  canvas?.renderAll();
                  onSelect(obj);
                }}
              >
                {isGradient && <Blend className="h-3 w-3 shrink-0 text-violet-400" />}
                <span className="truncate">{label}</span>
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleVisibility(obj)}
              >
                {obj.visible !== false ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400"
                onClick={() => removeObject(obj)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
