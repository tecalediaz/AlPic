import { NextResponse } from "next/server";
import { hashCode } from "@/lib/crypto";
import { sql } from "@/lib/db";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code : "";

    if (!code.trim()) {
      return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
    }

    const codeHash = hashCode(code);
    const result = await sql`SELECT id FROM codes WHERE code_hash = ${codeHash}`;

    if (result.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const codeId = result[0].id as string;
    const response = NextResponse.json({ codeId });
    response.cookies.set(SESSION_COOKIE, createSessionToken(codeId), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("POST /api/codes/verify error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
