"use client";

import { X } from "lucide-react";

interface WorkspacePhotoTagProps {
  width: number;
  height: number;
  onRemove: () => void;
}

export function WorkspacePhotoTag({ width, height, onRemove }: WorkspacePhotoTagProps) {
  return (
    <div className="workspace-photo-tag group mt-2">
      <span className="workspace-photo-tag__label">
        {width} × {height}px
      </span>
      <button
        type="button"
        className="workspace-photo-tag__remove"
        onClick={onRemove}
        aria-label="Quitar imagen"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
