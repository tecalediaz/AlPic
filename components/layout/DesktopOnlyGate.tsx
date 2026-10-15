import { Monitor } from "lucide-react";
import { AlpicLogo } from "@/components/layout/AlpicLogo";
import { LoginCreatorFooter } from "@/components/layout/LoginCreatorFooter";

interface DesktopOnlyGateProps {
  children: React.ReactNode;
}

export function DesktopOnlyGate({ children }: DesktopOnlyGateProps) {
  return (
    <>
      <div className="desktop-only-screen" role="alert" aria-live="polite">
        <div className="desktop-only-screen__glow desktop-only-screen__glow--1" aria-hidden />
        <div className="desktop-only-screen__glow desktop-only-screen__glow--2" aria-hidden />

        <div className="desktop-only-screen__main">
          <div className="desktop-only-screen__card">
            <AlpicLogo variant="onDark" size="lg" priority className="desktop-only-screen__logo" />

            <div className="desktop-only-screen__icon-wrap liquid-glass-btn" aria-hidden>
              <Monitor className="h-8 w-8" strokeWidth={1.5} />
            </div>

            <h1 className="desktop-only-screen__title">Solo disponible en desktop</h1>
            <p className="desktop-only-screen__text">
              Abrilo desde una computadora para usar Alpic.
            </p>

            <p className="desktop-only-screen__hint">Ancho mínimo recomendado: 800px</p>
          </div>
        </div>

        <LoginCreatorFooter />
      </div>

      <div className="desktop-only-content">{children}</div>
    </>
  );
}
