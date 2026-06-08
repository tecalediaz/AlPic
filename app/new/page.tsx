"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassPageHeader } from "@/components/layout/GlassPageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

      <div className="flex flex-1 items-center justify-center px-8">
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
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Crear primer estilo</CardTitle>
              <CardDescription>
                Definí el nombre y formato de tu primer estilo visual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStyle} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="styleName">Nombre del estilo</Label>
                  <Input
                    id="styleName"
                    placeholder="Mi primer diseño"
                    value={styleName}
                    onChange={(e) => setStyleName(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-muted">
                    Podés cambiar el formato desde el editor una vez creado
                  </p>
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading || !styleName.trim()}>
                  {loading ? "Creando..." : "Ir al editor"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
