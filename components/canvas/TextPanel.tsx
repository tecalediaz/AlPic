"use client";

import { type IText } from "fabric";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_GROUPS } from "@/lib/constants";
import { ColorInput } from "@/components/canvas/ColorInput";
import {
  NumberInput,
  OpacitySlider,
  RotationInput,
} from "@/components/canvas/FilterPanel";

interface TextPanelProps {
  obj: IText;
  onModified: () => void;
}

export function TextPanel({ obj, onModified }: TextPanelProps) {
  function update(props: Record<string, unknown>) {
    obj.set(props);
    obj.canvas?.renderAll();
    onModified();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Texto</p>
      <div className="space-y-2">
        <Label>Contenido</Label>
        <Textarea
          value={obj.text ?? ""}
          onChange={(e) => update({ text: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Fuente</Label>
        <Select value={obj.fontFamily} onValueChange={(v) => update({ fontFamily: v })}>
          <SelectTrigger style={{ fontFamily: obj.fontFamily }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {FONT_GROUPS.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.fonts.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tamaño ({Math.round(obj.fontSize ?? 32)}px)</Label>
        <Input
          type="number"
          value={obj.fontSize ?? 32}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <ColorInput
          value={typeof obj.fill === "string" ? obj.fill : "#ffffff"}
          onChange={(color) => update({ fill: color })}
        />
      </div>
      <div className="space-y-2">
        <Label>Alineación</Label>
        <div className="flex gap-2">
          {(["left", "center", "right"] as const).map((align) => (
            <Button
              key={align}
              variant={obj.textAlign === align ? "default" : "secondary"}
              size="sm"
              onClick={() => update({ textAlign: align })}
            >
              {align === "left" ? "Izq" : align === "center" ? "Centro" : "Der"}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant={obj.fontWeight === "bold" ? "default" : "secondary"}
          size="sm"
          onClick={() => update({ fontWeight: obj.fontWeight === "bold" ? "normal" : "bold" })}
        >
          Negrita
        </Button>
        <Button
          variant={obj.fontStyle === "italic" ? "default" : "secondary"}
          size="sm"
          onClick={() => update({ fontStyle: obj.fontStyle === "italic" ? "normal" : "italic" })}
        >
          Cursiva
        </Button>
        <Button
          variant={obj.underline ? "default" : "secondary"}
          size="sm"
          onClick={() => update({ underline: !obj.underline })}
        >
          Subrayado
        </Button>
      </div>
      <OpacitySlider value={obj.opacity ?? 1} onChange={(v) => update({ opacity: v })} />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={obj.left ?? 0} onChange={(v) => update({ left: v })} />
        <NumberInput label="Y" value={obj.top ?? 0} onChange={(v) => update({ top: v })} />
      </div>
      <RotationInput value={obj.angle ?? 0} onChange={(v) => update({ angle: v })} />
    </div>
  );
}
