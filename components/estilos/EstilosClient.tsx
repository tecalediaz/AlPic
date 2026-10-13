"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { NewStyleDialog } from "@/components/workspace/NewStyleDialog";
import { DeleteStyleDialog } from "@/components/workspace/DeleteStyleDialog";
import { GlassPageHeader } from "@/components/layout/GlassPageHeader";
import { PAGE_MAX_WIDTH } from "@/lib/layout";
import { StyleSelector } from "@/components/workspace/StyleSelector";
import type { StyleListItem } from "@/types";
import { LoaderCenter } from "@/components/ui/loader";
import { toast } from "sonner";
import { createLocalStyle, deleteLocalStyle, listLocalStyles } from "@/lib/local-styles";
import Link from "next/link";

interface EstilosClientProps {
  codeId: string;
}

export function EstilosClient({ codeId }: EstilosClientProps) {
  const router = useRouter();
  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newStyleName, setNewStyleName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StyleListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStyles = useCallback(() => {
    try {
      setStyles(listLocalStyles());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar estilos");
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      loadStyles();
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(task);
  }, [loadStyles]);

  async function handleCreateStyle() {
    if (!newStyleName.trim()) return;
    setCreating(true);
    try {
      const style = createLocalStyle(newStyleName);
      setShowNewForm(false);
      setNewStyleName("");
      router.push(`/editor/${codeId}/${style.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear estilo");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(styleId: string) {
    setDeleting(true);
    try {
      deleteLocalStyle(styleId);
      setStyles((prev) => prev.filter((s) => s.id !== styleId));
      toast.success("Estilo eliminado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar estilo");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) {
    return <LoaderCenter className="h-screen" size="lg" />;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <GlassPageHeader
          title="Estilos locales"
          backHref="/"
          actions={
            <button
              type="button"
              className="liquid-glass-btn glass-header-action"
              onClick={() => setShowNewForm(true)}
            >
              <Plus className="h-4 w-4" />
              Nuevo estilo
            </button>
          }
        />
        <div
          className="mx-auto w-full flex-1 px-8 py-6"
          style={{ maxWidth: PAGE_MAX_WIDTH }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>Se guardan solo en este navegador. Tus fotos no se suben a un servidor.</p>
            <Link href="/" className="text-primary hover:underline">Sobre el proyecto</Link>
          </div>
          {styles.length === 0 && (
            <div className="mb-6 rounded-xl border border-border bg-card p-7">
              <h2 className="text-xl font-semibold">Tu primer estilo empieza acá</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">Creá una plantilla, editá sus capas y después aplicala a una foto para descargar el resultado.</p>
              <button type="button" className="mt-5 rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover" onClick={() => setShowNewForm(true)}>Crear estilo</button>
            </div>
          )}
          <StyleSelector
            styles={styles}
            codeId={codeId}
            onSelect={(s) => router.push(`/workspace/${codeId}/${s.id}`)}
            onDelete={(s) => setDeleteTarget(s)}
          />
        </div>
      </div>

      <NewStyleDialog
        open={showNewForm}
        onOpenChange={(open) => {
          setShowNewForm(open);
          if (!open) setNewStyleName("");
        }}
        value={newStyleName}
        onChange={setNewStyleName}
        onSubmit={handleCreateStyle}
        creating={creating}
      />

      <DeleteStyleDialog
        target={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </>
  );
}
