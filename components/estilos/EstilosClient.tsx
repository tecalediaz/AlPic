"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { WorkspaceFloatingBar } from "@/components/workspace/WorkspaceFloatingBar";
import { NewStyleDialog } from "@/components/workspace/NewStyleDialog";
import { DeleteStyleDialog } from "@/components/workspace/DeleteStyleDialog";
import { GlassPageHeader } from "@/components/layout/GlassPageHeader";
import { PAGE_MAX_WIDTH } from "@/lib/layout";
import { StyleSelector } from "@/components/workspace/StyleSelector";
import { getInitialFabricJson } from "@/lib/canvas-config";
import type { StyleListItem } from "@/types";
import { LoaderCenter } from "@/components/ui/loader";
import { toast } from "sonner";

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

  const loadStyles = useCallback(async () => {
    try {
      const res = await fetch(`/api/styles?codeId=${codeId}`, { credentials: "include" });
      const data = await res.json();
      setStyles(data.styles ?? []);
    } catch {
      toast.error("Error al cargar estilos");
    }
  }, [codeId]);

  useEffect(() => {
    async function load() {
      await loadStyles();
      setLoading(false);
    }
    void load();
  }, [loadStyles]);

  async function handleCreateStyle() {
    if (!newStyleName.trim()) return;
    setCreating(true);
    try {
      const fabricJson = getInitialFabricJson("9:16");
      const res = await fetch("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code_id: codeId,
          name: newStyleName,
          aspect_ratio: "9:16",
          fabric_json: fabricJson,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowNewForm(false);
      setNewStyleName("");
      router.push(`/editor/${codeId}/${data.id}`);
    } catch {
      toast.error("Error al crear estilo");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(styleId: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/styles/${styleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setStyles((prev) => prev.filter((s) => s.id !== styleId));
      toast.success("Estilo eliminado");
    } catch {
      toast.error("Error al eliminar estilo");
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
          title="Mis estilos"
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
          <StyleSelector
            styles={styles}
            codeId={codeId}
            onSelect={(s) => router.push(`/workspace/${codeId}/${s.id}`)}
            onDelete={(s) => setDeleteTarget(s)}
          />
        </div>
      </div>

      <WorkspaceFloatingBar
        onSwitch={(newCodeId) => window.location.assign(`/estilos/${newCodeId}`)}
        onExit={() => window.location.assign("/")}
      />

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
