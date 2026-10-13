"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EditorClient } from "@/components/canvas/EditorClient";
import { PhotoWorkspaceClient } from "@/components/workspace/PhotoWorkspaceClient";
import { LoaderCenter } from "@/components/ui/loader";
import { getLocalStyle, LOCAL_WORKSPACE_ID } from "@/lib/local-styles";
import type { Style } from "@/types";

export function LocalStylePage({ codeId, styleId, mode }: { codeId: string; styleId: string; mode: "editor" | "workspace" }) {
  const [style, setStyle] = useState<Style | null>();
  const [error, setError] = useState("");

  useEffect(() => {
    const task = window.setTimeout(() => {
      try {
        setStyle(codeId === LOCAL_WORKSPACE_ID ? getLocalStyle(styleId) : null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo leer el estilo local.");
        setStyle(null);
      }
    }, 0);
    return () => window.clearTimeout(task);
  }, [codeId, styleId]);

  if (style === undefined && !error) return <LoaderCenter className="h-screen" size="lg" />;
  if (!style) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Estilo no disponible</h1>
      <p className="max-w-md text-muted-foreground">{error || "Este estilo no existe en este navegador. Los estilos se guardan localmente y no se comparten entre dispositivos."}</p>
      <Link href={`/estilos/${LOCAL_WORKSPACE_ID}`} className="rounded-full bg-primary px-5 py-2 text-white">Ver mis estilos</Link>
    </main>
  );

  return mode === "editor"
    ? <EditorClient codeId={codeId} styleId={styleId} initialStyle={style} />
    : <PhotoWorkspaceClient codeId={codeId} style={style} />;
}
