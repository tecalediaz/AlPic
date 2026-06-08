"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlpicLogo } from "@/components/layout/AlpicLogo";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [codeNotFound, setCodeNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCodeNotFound(false);
    setLoading(true);

    try {
      const res = await fetch("/api/codes/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.status === 404 && data.error === "not_found") {
        setCodeNotFound(true);
        setError("Este código no existe. Tenés que crear un nuevo estilo.");
        return;
      }

      if (!res.ok) {
        setError("Error al verificar el código");
        return;
      }

      if (!data.codeId) {
        setError("Error al verificar el código");
        return;
      }

      // Navegación completa para que la cookie de sesión viaje en la primera carga del workspace.
      window.location.assign(`/estilos/${data.codeId}`);
    } catch {
      setError("Error al verificar el código");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__image" aria-hidden>
        <Image
          src="/login-hero.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="login-page__image-src"
        />
        <div className="login-page__image-overlay" />
      </section>

      <section className="login-page__panel">
        <div className="login-page__glow login-page__glow--1" aria-hidden />
        <div className="login-page__glow login-page__glow--2" aria-hidden />

        <div className="login-page__content">
        <AlpicLogo variant="onDark" size="lg" priority className="mb-2" />

        <form onSubmit={handleSubmit} className="login-page__form">
          <div className="login-pill">
            <input
              type="text"
              className="login-pill__input"
              placeholder="Código de acceso"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (codeNotFound) {
                  setCodeNotFound(false);
                  setError("");
                }
              }}
              autoComplete="off"
            />
            <button
              type="submit"
              className="login-pill__submit"
              disabled={loading || !code.trim()}
            >
              {loading ? "..." : "Acceder"}
            </button>
          </div>
          {error && <p className="login-page__error">{error}</p>}
        </form>

        <Link
          href="/new"
          className={cn("login-page__link", codeNotFound && "login-page__link--highlight")}
        >
          Crear nuevo estilo
        </Link>
        </div>
      </section>
    </main>
  );
}
