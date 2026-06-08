"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface NewStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  creating?: boolean;
}

export function NewStyleDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  creating = false,
}: NewStyleDialogProps) {
  const canSubmit = value.trim().length > 0 && !creating;

  function handleSubmit() {
    if (!canSubmit) return;
    void onSubmit();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        overlayClassName="liquid-glass-overlay"
        className="new-style-dialog max-w-xl gap-0 border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">Nuevo estilo</DialogTitle>

        <div className="new-style-pill">
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nombre del estilo"
            className="new-style-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(
              "btn-accent-pill new-style-submit",
              !canSubmit && "opacity-40 cursor-not-allowed",
            )}
          >
            {creating ? "Creando..." : "Crear"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
