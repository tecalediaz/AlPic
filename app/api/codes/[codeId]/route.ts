import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionCodeId } from "@/lib/session";

type RouteContext = { params: Promise<{ codeId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { codeId } = await context.params;

    const sessionCodeId = await getSessionCodeId();
    if (sessionCodeId !== codeId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await sql`
      SELECT id, name, created_at
      FROM codes
      WHERE id = ${codeId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ code: result[0] });
  } catch (error) {
    console.error("GET /api/codes/[codeId] error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
