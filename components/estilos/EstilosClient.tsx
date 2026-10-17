"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { NewStyleDialog } from "@/components/workspace/NewStyleDialog";
import { DeleteStyleDialog } from "@/components/workspace/DeleteStyleDialog";
import { AlpicLogo } from "@/components/layout/AlpicLogo";
import { PAGE_MAX_WIDTH } from "@/lib/layout";
import { StyleSelector } from "@/components/workspace/StyleSelector";
import type { StyleListItem } from "@/types";
import { LoaderCenter } from "@/components/ui/loader";
import { toast } from "sonner";
import { createLocalStyle, deleteLocalStyle, listLocalStyles } from "@/lib/local-styles";

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
        <header className="styles-home-header">
          <AlpicLogo variant="onDark" size="md" href="/" priority className="styles-home-logo" />
        </header>
        <div
          className="mx-auto w-full flex-1 px-8 py-10"
          style={{ maxWidth: PAGE_MAX_WIDTH }}
        >
          {styles.length > 0 && (
            <div className="mb-6 flex justify-end">
              <button type="button" className="styles-home-create" onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4" /> Nuevo estilo
              </button>
            </div>
          )}
          {styles.length === 0 && (
            <section className="styles-home-empty" aria-labelledby="styles-empty-title">
              <div className="styles-home-empty__copy">
                <h1 id="styles-empty-title">Creá tu primer estilo.</h1>
                <button type="button" className="styles-home-create styles-home-create--large" onClick={() => setShowNewForm(true)}>
                  <Plus className="h-5 w-5" /> Crear estilo
                </button>
              </div>
            </section>
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
