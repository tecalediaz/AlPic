"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportControlsProps {
  outputWidth: number;
  outputHeight: number;
  hasPhoto: boolean;
  onDownload: () => void;
  canDownload: boolean;
  styleName: string;
}

export function ExportControls({
  outputWidth,
  outputHeight,
  hasPhoto,
  onDownload,
  canDownload,
  styleName,
}: ExportControlsProps) {
  return (
    <div className="space-y-3">
      {hasPhoto ? (
        <p className="text-xs text-muted-foreground">
          Resolución de salida:{" "}
          <span className="font-medium text-foreground">
            {outputWidth} × {outputHeight}px
          </span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Subí tu foto para ver la resolución de exportación
        </p>
      )}
      <Button className="w-full" disabled={!canDownload} onClick={onDownload}>
        <Download className="h-4 w-4" />
        Descargar {styleName}
      </Button>
    </div>
  );
}
