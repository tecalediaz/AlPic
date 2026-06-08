"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StyleListItem } from "@/types";

interface DeleteStyleDialogProps {
  target: StyleListItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (styleId: string) => void | Promise<void>;
  deleting?: boolean;
}

export function DeleteStyleDialog({
  target,
  onOpenChange,
  onConfirm,
  deleting = false,
}: DeleteStyleDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        overlayClassName="liquid-glass-overlay-danger"
        className="delete-style-dialog max-w-md gap-0 border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">Eliminar estilo</DialogTitle>

        <div className="delete-style-card">
          <div>
            <h2 className="delete-style-card__title">¿Eliminar estilo?</h2>
            <p className="delete-style-card__description mt-2">
              Se eliminará &quot;{target?.name}&quot;. Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="delete-style-card__actions">
            <button
              type="button"
              className="delete-style-card__cancel liquid-glass-btn hover:bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="delete-style-submit"
              disabled={!target || deleting}
              onClick={() => target && void onConfirm(target.id)}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
