"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SWATCH_STAGGER_MS = 55;
const SWATCH_ANIM_MS = 420;
const GROUP_ANIM_MS = 380;

interface WorkspaceTextColorSwatchesProps {
  visible: boolean;
  colors: readonly string[];
  activeColor?: string;
  onSelectColor: (color: string) => void;
}

export function WorkspaceTextColorSwatches({
  visible,
  colors,
  activeColor,
  onSelectColor,
}: WorkspaceTextColorSwatchesProps) {
  const [mounted, setMounted] = useState(visible);
  const [exiting, setExiting] = useState(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
      setMounted(true);
      setExiting(false);
      return;
    }

    if (!mounted) return;

    setExiting(true);
    const totalMs = Math.max(
      GROUP_ANIM_MS,
      SWATCH_ANIM_MS + (colors.length - 1) * SWATCH_STAGGER_MS,
    );

    exitTimeoutRef.current = setTimeout(() => {
      setMounted(false);
      setExiting(false);
      exitTimeoutRef.current = null;
    }, totalMs);

    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [visible, mounted, colors.length]);

  useEffect(
    () => () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    },
    [],
  );

  if (!mounted) return null;

  const normalizedActive = activeColor?.toLowerCase();

  return (
    <div
      className={cn(
        "workspace-text-color-swatches",
        exiting && "workspace-text-color-swatches--exiting",
      )}
      role="group"
      aria-label="Colores de texto"
      aria-hidden={exiting}
    >
      {colors.map((color, index) => {
        const isActive = normalizedActive === color.toLowerCase();
        const isLight = color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#facc15";
        const delay = exiting
          ? (colors.length - 1 - index) * SWATCH_STAGGER_MS
          : index * SWATCH_STAGGER_MS;

        return (
          <button
            key={color}
            type="button"
            className={cn(
              "workspace-text-color-swatch",
              exiting && "workspace-text-color-swatch--exiting",
              isActive && "workspace-text-color-swatch--active",
              isLight && "workspace-text-color-swatch--light",
            )}
            style={{
              backgroundColor: color,
              animationDelay: `${delay}ms`,
            }}
            onClick={() => onSelectColor(color)}
            title={`Color ${color}`}
            aria-label={`Aplicar color ${color}`}
            aria-pressed={isActive}
            tabIndex={exiting ? -1 : 0}
          />
        );
      })}
    </div>
  );
}
