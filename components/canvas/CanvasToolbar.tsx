"use client";

import { useRef } from "react";
import { Circle, IText, Rect, type Canvas } from "fabric";
import { Type, ImagePlus, Square, Circle as CircleIcon, Blend } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createGradientLayer, loadSVGAsGroup, placeGradientLayer } from "@/lib/fabric-utils";
import { ACCEPTED_IMAGE_TYPES, readFileAsText } from "@/lib/canvas-config";
import {
  calcFitScale,
  centerObjectOnCanvas,
  loadFabricImageFromFile,
} from "@/lib/image-export";

interface CanvasToolbarProps {
  canvas: Canvas | null;
  canvasWidth: number;
  canvasHeight: number;
  onModified: () => void;
}

export function CanvasToolbar({
  canvas,
  canvasWidth,
  canvasHeight,
  onModified,
}: CanvasToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    canvas?.renderAll();
    onModified();
  }

  function addText() {
    if (!canvas) return;
    const text = new IText("Texto", {
      left: canvasWidth / 2 - 40,
      top: canvasHeight / 2 - 20,
      fontFamily: "Elms Sans",
      fontSize: 32,
      fill: "#ffffff",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    refresh();
  }

  async function addImage(file: File) {
    if (!canvas) return;

    const maxW = canvasWidth * 0.95;
    const maxH = canvasHeight * 0.95;

    if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      const svgText = await readFileAsText(file);
      const group = await loadSVGAsGroup(svgText, { maxWidth: maxW, maxHeight: maxH });
      if (!group) return;
      centerObjectOnCanvas(group, canvasWidth, canvasHeight);
      canvas.add(group);
      canvas.setActiveObject(group);
    } else {
      const img = await loadFabricImageFromFile(file);
      const nativeW = img.width ?? 1;
      const nativeH = img.height ?? 1;
      const scale = calcFitScale(nativeW, nativeH, maxW, maxH);
      img.set({ scaleX: scale, scaleY: scale });
      centerObjectOnCanvas(img, canvasWidth, canvasHeight);
      canvas.add(img);
      canvas.setActiveObject(img);
    }

    refresh();
  }

  function addRect() {
    if (!canvas) return;
    const rect = new Rect({
      left: canvasWidth / 2 - 50,
      top: canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      fill: "#D62553",
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    refresh();
  }

  function addCircle() {
    if (!canvas) return;
    const circle = new Circle({
      left: canvasWidth / 2 - 50,
      top: canvasHeight / 2 - 50,
      radius: 50,
      fill: "#D62553",
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    refresh();
  }

  function addGradientLayer() {
    if (!canvas) return;
    const layer = createGradientLayer(canvasWidth, canvasHeight);
    placeGradientLayer(canvas, layer);
    canvas.setActiveObject(layer);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={addText}>
            <Type className="h-4 w-4" />
            Texto
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
            Imagen
          </Button>
          <Button variant="secondary" size="sm" onClick={addRect}>
            <Square className="h-4 w-4" />
            Rectángulo
          </Button>
          <Button variant="secondary" size="sm" onClick={addCircle}>
            <CircleIcon className="h-4 w-4" />
            Círculo
          </Button>
          <Button variant="secondary" size="sm" className="col-span-2" onClick={addGradientLayer}>
            <Blend className="h-4 w-4" />
            Degradado
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void addImage(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
