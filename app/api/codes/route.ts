import { NextResponse } from "next/server";
import { hashCode } from "@/lib/crypto";
import { sql } from "@/lib/db";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code : "";
    const name = typeof body.name === "string" ? body.name.trim() || null : null;

    if (code.trim().length < 4) {
      return NextResponse.json({ error: "Código muy corto" }, { status: 400 });
    }

    const codeHash = hashCode(code);

    const existing = await sql`SELECT id FROM codes WHERE code_hash = ${codeHash}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ese código ya existe" }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO codes (code_hash, name)
      VALUES (${codeHash}, ${name})
      RETURNING id
    `;

    const codeId = result[0].id as string;
    const response = NextResponse.json({ id: codeId }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(codeId), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("POST /api/codes error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
