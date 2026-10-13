"use client";

import { cn } from "@/lib/utils";

const SWATCH_STAGGER_MS = 55;

interface WorkspaceTextColorSwatchesProps {
  visible: boolean;
  colors: readonly string[];
  activeColor?: string;
  onSelectColor: (color: string) => void;
}

export function WorkspaceTextColorSwatches({ visible, colors, activeColor, onSelectColor }: WorkspaceTextColorSwatchesProps) {
  if (!visible) return null;

  const normalizedActive = activeColor?.toLowerCase();
  return (
    <div className="workspace-text-color-swatches" role="group" aria-label="Colores de texto">
      {colors.map((color, index) => {
        const isActive = normalizedActive === color.toLowerCase();
        const isLight = color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#facc15";
        return (
          <button
            key={color}
            type="button"
            className={cn("workspace-text-color-swatch", isActive && "workspace-text-color-swatch--active", isLight && "workspace-text-color-swatch--light")}
            style={{ backgroundColor: color, animationDelay: `${index * SWATCH_STAGGER_MS}ms` }}
            onClick={() => onSelectColor(color)}
            title={`Color ${color}`}
            aria-label={`Aplicar color ${color}`}
            aria-pressed={isActive}
          />
        );
      })}
    </div>
  );
}
