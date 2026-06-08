"use client";

import { useEffect, useRef } from "react";
import { FONT_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserTextPickerPosition } from "@/lib/workspace-text";

interface WorkspaceTextFontPickerProps {
  position: UserTextPickerPosition;
  activeFont: string;
  onSelectFont: (font: string) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export function WorkspaceTextFontPicker({
  position,
  activeFont,
  onSelectFont,
  onPointerEnter,
  onPointerLeave,
}: WorkspaceTextFontPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const margin = 12;
    let left = position.x - rect.width / 2;
    let top = position.y - rect.height - 10;

    left = Math.max(margin, Math.min(left, window.innerWidth - rect.width - margin));
    top = Math.max(margin, top);

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }, [position.x, position.y, activeFont]);

  return (
    <div
      ref={panelRef}
      className="workspace-text-font-picker"
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
    >
      {FONT_GROUPS.map((group) => (
        <div key={group.label} className="workspace-text-font-picker__group">
          <p className="workspace-text-font-picker__label">{group.label}</p>
          <div className="workspace-text-font-picker__fonts">
            {group.fonts.map((font) => (
              <button
                key={font}
                type="button"
                className={cn(
                  "workspace-text-font-picker__font",
                  activeFont === font && "workspace-text-font-picker__font--active",
                )}
                style={{ fontFamily: font }}
                onClick={() => onSelectFont(font)}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
