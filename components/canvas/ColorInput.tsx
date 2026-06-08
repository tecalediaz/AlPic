"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { TRANSPARENT_COLOR } from "@/lib/gradient-utils";

function normalizeHex(input: string): string | null {
  let v = input.trim();
  if (!v.startsWith("#")) v = `#${v}`;
  if (/^#[0-9A-Fa-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/i.test(v)) {
    const [, r, g, b] = v;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function toDisplayHex(value: string): string {
  if (value === TRANSPARENT_COLOR) return "#000000";
  if (value.startsWith("#")) return value.toLowerCase();
  return `#${value}`.toLowerCase();
}

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ value, onChange }: ColorInputProps) {
  const hex = toDisplayHex(value);
  const pickerValue = /^#[0-9A-Fa-f]{6}$/i.test(hex) ? hex : "#000000";
  const [text, setText] = useState(hex);
  const [prevHex, setPrevHex] = useState(hex);

  // Sincroniza el texto editable cuando el valor externo cambia (patrón recomendado: ajustar estado en render).
  if (hex !== prevHex) {
    setPrevHex(hex);
    setText(hex);
  }

  return (
    <div className="flex gap-2">
      <label className="relative block h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border">
        <span
          className="absolute inset-0"
          style={{ backgroundColor: pickerValue }}
          aria-hidden
        />
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Elegir color"
        />
      </label>
      <Input
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const normalized = normalizeHex(raw);
          if (normalized) onChange(normalized);
        }}
        onBlur={() => {
          const normalized = normalizeHex(text);
          if (normalized) {
            onChange(normalized);
            setText(normalized);
          } else {
            setText(hex);
          }
        }}
        placeholder="#ffffff"
        className="h-10 font-mono"
        spellCheck={false}
      />
    </div>
  );
}

interface GradientColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function GradientColorInput({ value, onChange }: GradientColorInputProps) {
  const isTransparent = value === TRANSPARENT_COLOR;
  const [lastOpaque, setLastOpaque] = useState("#D62553");
  const [prevValue, setPrevValue] = useState<string | null>(null);

  // Recuerda el último color opaco cuando el valor externo cambia (ajuste de estado en render).
  if (value !== prevValue) {
    setPrevValue(value);
    if (!isTransparent && value.startsWith("#")) {
      setLastOpaque(value);
    }
  }

  return (
    <div className="space-y-2">
      {isTransparent ? (
        <div
          className="h-10 w-full rounded-md border border-border"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)",
            backgroundSize: "12px 12px",
            backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
            backgroundColor: "#27272a",
          }}
        />
      ) : (
        <ColorInput value={value} onChange={onChange} />
      )}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isTransparent}
          onChange={(e) => {
            if (e.target.checked) onChange(TRANSPARENT_COLOR);
            else onChange(lastOpaque);
          }}
          className="h-4 w-4 rounded border-border"
        />
        Transparente
      </label>
    </div>
  );
}
