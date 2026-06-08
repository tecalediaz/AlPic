"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import type { FabricFilters } from "@/types";

interface FilterPanelProps {
  filters: FabricFilters;
  onChange: (filters: FabricFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Brillo ({Math.round(filters.brightness * 100)})</Label>
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[filters.brightness * 100]}
          onValueChange={([v]) => onChange({ ...filters, brightness: v / 100 })}
        />
      </div>
      <div className="space-y-2">
        <Label>Contraste ({Math.round(filters.contrast * 100)})</Label>
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[filters.contrast * 100]}
          onValueChange={([v]) => onChange({ ...filters, contrast: v / 100 })}
        />
      </div>
      <div className="space-y-2">
        <Label>Saturación ({Math.round(filters.saturation * 100)})</Label>
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[filters.saturation * 100]}
          onValueChange={([v]) => onChange({ ...filters, saturation: v / 100 })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Escala de grises</Label>
        <input
          type="checkbox"
          checked={filters.grayscale}
          onChange={(e) => onChange({ ...filters, grayscale: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
      </div>
      <div className="space-y-2">
        <Label>Desenfoque ({filters.blur.toFixed(1)})</Label>
        <Slider
          min={0}
          max={10}
          step={0.1}
          value={[filters.blur]}
          onValueChange={([v]) => onChange({ ...filters, blur: v })}
        />
      </div>
    </div>
  );
}

const NUMERIC_DRAFT_PATTERN = /^-?\d*$/;

function useNumericInputDraft(
  value: number,
  onChange: (v: number) => void,
  options: { commitOnBlur?: boolean; clamp?: (n: number) => number } = {},
) {
  const { commitOnBlur = false, clamp } = options;
  const [draft, setDraft] = useState<string | null>(null);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(null);
    }
  }, [value]);

  const displayValue = draft !== null ? draft : String(Math.round(value));

  function handleChange(raw: string) {
    if (!NUMERIC_DRAFT_PATTERN.test(raw)) return;

    if (raw === "" || raw === "-") {
      setDraft(raw);
      return;
    }

    const next = Number(raw);
    if (Number.isNaN(next)) return;

    setDraft(raw);
    if (!commitOnBlur) {
      onChange(clamp ? clamp(next) : next);
    }
  }

  function handleFocus() {
    focusedRef.current = true;
    setDraft(String(Math.round(value)));
  }

  function commit() {
    if (draft === "" || draft === "-") {
      setDraft(null);
      return;
    }
    if (draft !== null) {
      const next = Number(draft);
      if (!Number.isNaN(next)) {
        onChange(clamp ? clamp(next) : next);
      }
      setDraft(null);
    }
  }

  function handleBlur() {
    focusedRef.current = false;
    commit();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commit();
      e.currentTarget.blur();
    }
  }

  return { displayValue, handleChange, handleFocus, handleBlur, handleKeyDown };
}

export function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const input = useNumericInputDraft(value, onChange);

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="text"
        inputMode="numeric"
        value={input.displayValue}
        onFocus={input.handleFocus}
        onChange={(e) => input.handleChange(e.target.value)}
        onBlur={input.handleBlur}
        onKeyDown={input.handleKeyDown}
        className="h-8"
      />
    </div>
  );
}

export function ScaleSlider({
  value,
  onChange,
  min = 5,
  max = 500,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const pct = Math.round(value * 100);
  const clampedPct = Math.min(max, Math.max(min, pct));

  return (
    <div className="space-y-2">
      <Label>Escala ({clampedPct}%)</Label>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[clampedPct]}
        onValueChange={([v]) => onChange(v / 100)}
      />
    </div>
  );
}

export function OpacitySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Opacidad ({Math.round(value * 100)}%)</Label>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[value * 100]}
        onValueChange={([v]) => onChange(v / 100)}
      />
    </div>
  );
}

export function RotationInput({
  value,
  onChange,
  min = -360,
  max = 360,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  const input = useNumericInputDraft(value, onChange, { commitOnBlur: true, clamp });

  return (
    <div className="space-y-1">
      <Label>Ángulo (°)</Label>
      <Input
        type="text"
        inputMode="numeric"
        value={input.displayValue}
        onFocus={input.handleFocus}
        onChange={(e) => input.handleChange(e.target.value)}
        onBlur={input.handleBlur}
        onKeyDown={input.handleKeyDown}
        className="h-8"
        placeholder="0"
      />
    </div>
  );
}
