"use client";

import { useRef } from "react";
import { FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import {
  NumberInput,
  OpacitySlider,
  RotationInput,
  ScaleSlider,
} from "@/components/canvas/FilterPanel";
import { loadSVGAsGroup } from "@/lib/fabric-utils";
import { ACCEPTED_IMAGE_TYPES, readFileAsText } from "@/lib/canvas-config";
import {
  applyHighQualityObjectSettings,
  loadFabricImageFromFile,
} from "@/lib/image-export";

interface ImagePanelProps {
  obj: FabricImage;
  onModified: () => void;
}

export function ImagePanel({ obj, onModified }: ImagePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function update(props: Record<string, unknown>) {
    obj.set(props);
    obj.canvas?.renderAll();
    onModified();
  }

  async function replaceImage(file: File) {
    const canvas = obj.canvas;

    if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      if (!canvas) return;
      const svgText = await readFileAsText(file);
      const currentW = (obj.width ?? 100) * (obj.scaleX ?? 1);
      const group = await loadSVGAsGroup(svgText, { targetWidth: currentW });
      if (!group) return;
      group.set({
        left: obj.left,
        top: obj.top,
        angle: obj.angle ?? 0,
        opacity: obj.opacity ?? 1,
      });
      canvas.remove(obj);
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      onModified();
      return;
    }

    const currentVisualW = (obj.width ?? 1) * (obj.scaleX ?? 1);
    const newImg = await loadFabricImageFromFile(file);
    const nativeW = newImg.width ?? 1;
    const scale = currentVisualW / nativeW;

    obj.setElement(newImg.getElement());
    obj.set({ scaleX: scale, scaleY: scale });
    applyHighQualityObjectSettings(obj);
    canvas?.renderAll();
    onModified();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Imagen</p>
      <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
        Reemplazar imagen
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void replaceImage(file);
          e.target.value = "";
        }}
      />
      <ScaleSlider
        value={obj.scaleX ?? 1}
        onChange={(v) => update({ scaleX: v, scaleY: v })}
      />
      <OpacitySlider value={obj.opacity ?? 1} onChange={(v) => update({ opacity: v })} />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={obj.left ?? 0} onChange={(v) => update({ left: v })} />
        <NumberInput label="Y" value={obj.top ?? 0} onChange={(v) => update({ top: v })} />
      </div>
      <RotationInput value={obj.angle ?? 0} onChange={(v) => update({ angle: v })} />
    </div>
  );
}
