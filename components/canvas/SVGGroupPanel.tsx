"use client";

import { type Group } from "fabric";
import {
  NumberInput,
  OpacitySlider,
  RotationInput,
  ScaleSlider,
} from "@/components/canvas/FilterPanel";

interface SVGGroupPanelProps {
  obj: Group;
  onModified: () => void;
}

export function SVGGroupPanel({ obj, onModified }: SVGGroupPanelProps) {
  function update(props: Record<string, unknown>) {
    obj.set(props);
    obj.canvas?.renderAll();
    onModified();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Imagen</p>
      <ScaleSlider
        value={obj.scaleX ?? 1}
        onChange={(v) => update({ scaleX: v, scaleY: v })}
      />
      <OpacitySlider
        value={obj.opacity ?? 1}
        onChange={(v) => update({ opacity: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="X"
          value={obj.left ?? 0}
          onChange={(v) => update({ left: v })}
        />
        <NumberInput
          label="Y"
          value={obj.top ?? 0}
          onChange={(v) => update({ top: v })}
        />
      </div>
      <RotationInput
        value={obj.angle ?? 0}
        onChange={(v) => update({ angle: v })}
      />
    </div>
  );
}
