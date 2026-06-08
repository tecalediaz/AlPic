"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ImageUploader } from "@/components/workspace/ImageUploader";
import { ExportControls } from "@/components/workspace/ExportControls";
import type { ProcessingCanvasHandle } from "@/components/workspace/ProcessingCanvas";
import { getCanvasDimensions } from "@/lib/canvas-config";
import { getExportDimensions, getImageNaturalSize } from "@/lib/image-export";
import { WORKSPACE_CONTROLS_WIDTH } from "@/lib/layout";
import { ASPECT_RATIOS } from "@/lib/constants";
import type { Style } from "@/types";
import { LoaderCenter } from "@/components/ui/loader";
import { GlassPageHeader } from "@/components/layout/GlassPageHeader";

const ProcessingCanvas = dynamic(
  () => import("@/components/workspace/ProcessingCanvas"),
  {
    ssr: false,
    loading: () => <LoaderCenter className="h-[400px] w-full" />,
  },
);

interface PhotoWorkspaceClientProps {
  codeId: string;
  style: Style;
}

export function PhotoWorkspaceClient({ codeId, style }: PhotoWorkspaceClientProps) {
  const canvasRef = useRef<ProcessingCanvasHandle>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [exportMultiplier, setExportMultiplier] = useState(1);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [canvasWarning, setCanvasWarning] = useState<string | null>(null);

  const { displayWidth, displayHeight } = getCanvasDimensions(style.aspect_ratio);
  const exportDims = getExportDimensions(displayWidth, displayHeight, exportMultiplier);

  const handleDownload = useCallback(() => {
    const dataUrl = canvasRef.current?.exportImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `alpic-${style.name}-${Date.now()}.png`;
    a.click();
  }, [style.name]);

  const refreshExportMultiplier = useCallback(() => {
    setExportMultiplier(canvasRef.current?.getExportMultiplier() ?? 1);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <GlassPageHeader
        backHref={`/estilos/${codeId}`}
        backLabel="← Estilos"
        title={style.name}
        subtitle={`${style.aspect_ratio} — ${ASPECT_RATIOS[style.aspect_ratio].label}`}
      />
      <div
        className="grid min-h-0 flex-1 overflow-hidden"
        style={{ gridTemplateColumns: `${WORKSPACE_CONTROLS_WIDTH}px 1fr` }}
      >
        <div className="panel-scroll space-y-6 overflow-y-auto p-6">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
              Imagen
            </p>
            <ImageUploader
              onUpload={async (file) => {
                const url = URL.createObjectURL(file);
                const dims = await getImageNaturalSize(url);
                URL.revokeObjectURL(url);

                await canvasRef.current?.setUserPhoto(file);
                refreshExportMultiplier();
                setHasPhoto(dims.w > 0);
              }}
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
              Exportar
            </p>
            <ExportControls
              outputWidth={exportDims.width}
              outputHeight={exportDims.height}
              hasPhoto={hasPhoto}
              onDownload={handleDownload}
              canDownload={hasPhoto && !canvasError}
              styleName={style.name}
            />
          </div>
        </div>

        <div className="panel-scroll flex flex-col items-center justify-center gap-4 overflow-auto bg-background p-8">
          {canvasError ? (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-6 text-center text-danger">
              {canvasError}
            </div>
          ) : (
            <>
              {canvasWarning ? (
                <div className="max-w-lg rounded-lg border border-accent/30 bg-accent-muted p-4 text-center text-sm text-foreground">
                  {canvasWarning}
                </div>
              ) : null}
              <ProcessingCanvas
                key={`${style.id}-${style.updated_at}`}
                ref={canvasRef}
                aspectRatio={style.aspect_ratio}
                fabricJson={style.fabric_json}
                onError={setCanvasError}
                onWarning={setCanvasWarning}
                onPhotoChange={refreshExportMultiplier}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
