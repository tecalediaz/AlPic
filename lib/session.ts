import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "alpic_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

function getSecret(): string {
  const secret = process.env.SESSION_SECRET ?? process.env.DATABASE_URL;
  if (!secret) {
    // Sin secreto no se puede firmar de forma segura. Forzar configuración.
    throw new Error(
      "Falta SESSION_SECRET (o DATABASE_URL) para firmar la sesión.",
    );
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Genera un token de sesión firmado: `${codeId}.${hmac}`. */
export function createSessionToken(codeId: string): string {
  return `${codeId}.${sign(codeId)}`;
}

/** Verifica el token y devuelve el codeId si la firma es válida. */
export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex <= 0) return null;

  const codeId = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expected = sign(codeId);

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;

  return codeId;
}

/** Opciones estándar para la cookie de sesión. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Lee el codeId de la sesión actual desde las cookies (server). */
export async function getSessionCodeId(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
