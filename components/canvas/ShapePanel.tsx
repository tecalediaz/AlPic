"use client";

import { Circle, Rect, type FabricObject } from "fabric";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  NumberInput,
  OpacitySlider,
  RotationInput,
} from "@/components/canvas/FilterPanel";
import { isCircleObject } from "@/lib/fabric-utils";
import { ColorInput } from "@/components/canvas/ColorInput";

interface ShapePanelProps {
  obj: FabricObject;
  onModified: () => void;
}

export function ShapePanel({ obj, onModified }: ShapePanelProps) {
  const isCircle = isCircleObject(obj);

  function update(props: Record<string, unknown>) {
    obj.set(props);
    obj.canvas?.renderAll();
    onModified();
  }

  const fillColor =
    typeof obj.fill === "string" ? obj.fill : "#D62553";
  const strokeColor =
    typeof obj.stroke === "string" ? obj.stroke : "#ffffff";

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Forma</p>
      <div className="space-y-2">
        <Label>Color de relleno</Label>
        <ColorInput
          value={fillColor.startsWith("#") ? fillColor : "#D62553"}
          onChange={(color) => update({ fill: color })}
        />
      </div>
      <div className="space-y-2">
        <Label>Color de borde</Label>
        <ColorInput
          value={strokeColor.startsWith("#") ? strokeColor : "#ffffff"}
          onChange={(color) => update({ stroke: color })}
        />
      </div>
      <div className="space-y-2">
        <Label>Grosor de borde</Label>
        <Input
          type="number"
          value={obj.strokeWidth ?? 0}
          onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
        />
      </div>
      <OpacitySlider value={obj.opacity ?? 1} onChange={(v) => update({ opacity: v })} />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={obj.left ?? 0} onChange={(v) => update({ left: v })} />
        <NumberInput label="Y" value={obj.top ?? 0} onChange={(v) => update({ top: v })} />
        {!isCircle && (
          <>
            <NumberInput
              label="Ancho"
              value={(obj as Rect).width ?? 0}
              onChange={(v) => update({ width: v })}
            />
            <NumberInput
              label="Alto"
              value={(obj as Rect).height ?? 0}
              onChange={(v) => update({ height: v })}
            />
          </>
        )}
        {isCircle && (
          <NumberInput
            label="Radio"
            value={(obj as Circle).radius ?? 50}
            onChange={(v) => update({ radius: v })}
          />
        )}
      </div>
      <RotationInput value={obj.angle ?? 0} onChange={(v) => update({ angle: v })} />
    </div>
  );
}
