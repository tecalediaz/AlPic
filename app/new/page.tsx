"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlpicLogo } from "@/components/layout/AlpicLogo";
import { GlassPageHeader } from "@/components/layout/GlassPageHeader";
import { getInitialFabricJson } from "@/lib/canvas-config";

const STEPS = [
  { num: 1, label: "Código de acceso" },
  { num: 2, label: "Primer estilo" },
];

export default function NewPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [codeId, setCodeId] = useState("");
  const [code, setCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [styleName, setStyleName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const codesMatch = code === confirmCode && code.trim().length >= 4;

  async function handleCreateCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!codesMatch) {
      setError("Los códigos deben coincidir y tener al menos 4 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear el código");
        return;
      }

      setCodeId(data.id);
      setStep(2);
    } catch {
      setError("Error al crear el código");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStyle(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!styleName.trim()) {
      setError("El nombre del estilo es requerido");
      return;
    }

    setLoading(true);
    try {
      const fabricJson = getInitialFabricJson("9:16");
      const res = await fetch("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code_id: codeId,
          name: styleName,
          aspect_ratio: "9:16",
          fabric_json: fabricJson,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear el estilo");
        return;
      }

      router.push(`/editor/${codeId}/${data.id}`);
    } catch {
      setError("Error al crear el estilo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <GlassPageHeader
        backHref="/"
        steps={STEPS.map(({ num, label }) => ({
          num,
          label,
          status: step === num ? "active" : step > num ? "done" : "pending",
        }))}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8">
        <AlpicLogo variant="onDark" size="lg" />

        {step === 1 ? (
          <form onSubmit={handleCreateCode} className="login-page__form w-full max-w-3xl">
            <div className="login-pill">
              <input
                id="code"
                type="text"
                className="login-pill__input"
                placeholder="Código de acceso"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
              />
              <input
                id="confirmCode"
                type="text"
                className="login-pill__input"
                placeholder="Confirmar código"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="login-pill__submit"
                disabled={loading || !codesMatch}
              >
                {loading ? "..." : "Continuar →"}
              </button>
            </div>
            {error && <p className="login-page__error">{error}</p>}
          </form>
        ) : (
          <form onSubmit={handleCreateStyle} className="login-page__form w-full max-w-3xl">
            <div className="login-pill">
              <input
                id="styleName"
                type="text"
                className="login-pill__input"
                placeholder="Nombre del estilo"
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                autoFocus
                autoComplete="off"
              />
              <button
                type="submit"
                className="login-pill__submit"
                disabled={loading || !styleName.trim()}
              >
                {loading ? "..." : "Ir al editor"}
              </button>
            </div>
            {error && <p className="login-page__error">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
