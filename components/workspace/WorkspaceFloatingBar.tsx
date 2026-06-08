"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

interface WorkspaceFloatingBarProps {
  onSwitch: (codeId: string) => void;
  onExit: () => void;
}

export function WorkspaceFloatingBar({ onSwitch, onExit }: WorkspaceFloatingBarProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccess() {
    if (!code.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/codes/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.codeId) {
        setError("Código incorrecto");
        return;
      }
      setCode("");
      setError("");
      onSwitch(data.codeId);
    } catch {
      setError("Error al verificar el código");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workspace-floating-bar">
      <div className="workspace-floating-pill">
        <input
          type="text"
          className="workspace-floating-input"
          placeholder="Código de acceso"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          autoComplete="off"
          onKeyDown={(e) => { if (e.key === "Enter") void handleAccess(); }}
        />
        <button
          type="button"
          className="workspace-floating-submit"
          disabled={loading || !code.trim()}
          onClick={() => void handleAccess()}
        >
          {loading ? "..." : "Acceder"}
        </button>
        <div className="workspace-floating-divider" />
        <button
          type="button"
          className="workspace-floating-exit"
          title="Salir"
          onClick={onExit}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p className="workspace-floating-error">{error}</p>
      )}
    </div>
  );
}
