"use client";

import { useCallback, useId, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUpload: (file: File) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function ImageUploader({ onUpload, disabled, className }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputId = useId();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("El archivo no es una imagen válida");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("La imagen supera los 20MB permitidos");
        return;
      }
      try {
        await onUpload(file);
      } catch {
        toast.error("No se pudo cargar la imagen. Probá con otro archivo.");
      }
    },
    [onUpload],
  );

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "liquid-glass-btn flex min-h-[6.75rem] cursor-pointer flex-col items-center justify-center rounded-xl p-8",
        dragOver && "scale-[1.02] border-accent/40",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        aria-label="Cargar imagen desde el equipo"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) void handleFile(file);
          e.currentTarget.value = "";
        }}
      />
      <Upload className="h-10 w-10 text-muted" />
      <span className="mt-2 text-center text-xs text-muted">Cargar imagen</span>
    </label>
  );
}
