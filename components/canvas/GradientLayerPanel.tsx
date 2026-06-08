"use client";

import { useRef, useCallback } from "react";
import { type Rect } from "fabric";
import { Label } from "@/components/ui/label";
import { GradientColorInput } from "@/components/canvas/ColorInput";
import { RotationInput } from "@/components/canvas/FilterPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applyGradientLayerFill,
  getGradientLayerData,
  getGradientLayerDisplayAngle,
} from "@/lib/fabric-utils";
import {
  GRADIENT_ANGLE_MAX,
  GRADIENT_ANGLE_MIN,
  clampGradientAngle,
  resolveGradientStop,
} from "@/lib/gradient-utils";
import type { GradientLayerData } from "@/types";

interface GradientLayerPanelProps {
  obj: Rect;
  onModified: () => void;
}

// ─── Barra de degradado interactiva ──────────────────────────────────────────

interface GradientBarProps {
  data: GradientLayerData;
  onChange: (partial: Partial<GradientLayerData>) => void;
}

function GradientBar({ data, onChange }: GradientBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const c1 = resolveGradientStop(data.color1, data.color2);
  const c2 = resolveGradientStop(data.color2, data.color1);
  const s1 = data.stop1 ?? 0;
  const s2 = data.stop2 ?? 1;

  // CSS gradient para previsualizar con los stops actuales
  const pct1 = Math.round(s1 * 100);
  const pct2 = Math.round(s2 * 100);
  const [leftPct, leftColor, rightPct, rightColor] =
    s1 <= s2
      ? [pct1, c1, pct2, c2]
      : [pct2, c2, pct1, c1];

  const cssGradient =
    data.gradientType === "radial"
      ? `radial-gradient(circle, ${leftColor} ${leftPct}%, ${rightColor} ${rightPct}%)`
      : `linear-gradient(90deg, ${leftColor} ${leftPct}%, ${rightColor} ${rightPct}%)`;

  function getOffsetFromPointer(clientX: number): number {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function startDrag(
    stopKey: "stop1" | "stop2",
    e: React.PointerEvent<HTMLDivElement>,
  ) {
    e.currentTarget.setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      const offset = getOffsetFromPointer(ev.clientX);
      onChange({ [stopKey]: offset });
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // Handler para click directo en la barra (mueve el handle más cercano)
  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.handle) return;
    const offset = getOffsetFromPointer(e.clientX);
    const d1 = Math.abs(offset - s1);
    const d2 = Math.abs(offset - s2);
    onChange(d1 <= d2 ? { stop1: offset } : { stop2: offset });
  }

  const Handle = useCallback(
    ({
      stopKey,
      offset,
      color,
    }: {
      stopKey: "stop1" | "stop2";
      offset: number;
      color: string;
    }) => (
      <div
        data-handle={stopKey}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-3 rounded-sm border-2 border-white shadow-md cursor-ew-resize ring-1 ring-black/20"
        style={{ left: `${offset * 100}%`, backgroundColor: color }}
        onPointerDown={(e) => startDrag(stopKey, e)}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s1, s2, data.color1, data.color2],
  );

  return (
    <div className="space-y-1">
      <Label className="text-xs">Posición de los colores</Label>
      <div
        ref={barRef}
        className="relative h-6 rounded-md cursor-pointer select-none"
        style={{ background: cssGradient }}
        onClick={handleBarClick}
      >
        <Handle stopKey="stop1" offset={s1} color={c1} />
        <Handle stopKey="stop2" offset={s2} color={c2} />
      </div>
      <div className="flex justify-between text-[10px] text-muted px-0.5">
        <span>{Math.round(s1 * 100)}%</span>
        <span>{Math.round(s2 * 100)}%</span>
      </div>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export function GradientLayerPanel({ obj, onModified }: GradientLayerPanelProps) {
  const data = getGradientLayerData(obj);
  const displayAngle = getGradientLayerDisplayAngle(obj);

  function update(partial: Partial<GradientLayerData>) {
    const next = { ...data, ...partial };
    applyGradientLayerFill(obj, next);
    obj.canvas?.renderAll();
    onModified();
  }

  function handleAngleChange(angle: number) {
    const clamped = clampGradientAngle(angle);
    update({ angle: clamped });
    if ((obj.angle ?? 0) !== 0) {
      obj.set({ angle: 0 });
      obj.setCoords();
      obj.canvas?.renderAll();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Degradado</p>
        <p className="mt-1 text-xs text-muted">
          Mové y redimensioná la capa directamente en el canvas.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={data.gradientType}
          onValueChange={(type: GradientLayerData["gradientType"]) =>
            update({ gradientType: type })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Degradado lineal</SelectItem>
            <SelectItem value="radial">Degradado radial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Barra de posición de stops */}
      <GradientBar data={data} onChange={update} />

      {/* Color 1 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full border border-white/30 ring-1 ring-black/20 shrink-0"
            style={{ backgroundColor: resolveGradientStop(data.color1, data.color2) }}
          />
          <Label>Color 1 — {Math.round((data.stop1 ?? 0) * 100)}%</Label>
        </div>
        <GradientColorInput
          value={data.color1}
          onChange={(color) => update({ color1: color })}
        />
      </div>

      {/* Color 2 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full border border-white/30 ring-1 ring-black/20 shrink-0"
            style={{ backgroundColor: resolveGradientStop(data.color2, data.color1) }}
          />
          <Label>Color 2 — {Math.round((data.stop2 ?? 1) * 100)}%</Label>
        </div>
        <GradientColorInput
          value={data.color2}
          onChange={(color) => update({ color2: color })}
        />
      </div>

      {data.gradientType === "linear" && (
        <RotationInput
          value={displayAngle}
          onChange={handleAngleChange}
          min={GRADIENT_ANGLE_MIN}
          max={GRADIENT_ANGLE_MAX}
        />
      )}
    </div>
  );
}
