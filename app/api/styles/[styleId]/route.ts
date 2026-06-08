import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionCodeId } from "@/lib/session";

type RouteContext = { params: Promise<{ styleId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { styleId } = await context.params;

    const result = await sql`
      SELECT id, code_id, name, fabric_json, aspect_ratio, thumbnail, created_at, updated_at
      FROM styles
      WHERE id = ${styleId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Estilo no encontrado" }, { status: 404 });
    }

    const sessionCodeId = await getSessionCodeId();
    if (sessionCodeId !== result[0].code_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.json(
      { style: result[0] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("GET /api/styles/[styleId] error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { styleId } = await context.params;
    const body = await request.json();

    const existing = await sql`SELECT id, code_id FROM styles WHERE id = ${styleId}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Estilo no encontrado" }, { status: 404 });
    }

    const sessionCodeId = await getSessionCodeId();
    if (sessionCodeId !== existing[0].code_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const VALID_RATIOS = ["1:1", "4:5", "9:16", "16:9", "1.91:1"];
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const fabricJson = body.fabric_json;
    const thumbnail = body.thumbnail;
    const aspectRatio =
      typeof body.aspect_ratio === "string" && VALID_RATIOS.includes(body.aspect_ratio)
        ? body.aspect_ratio
        : undefined;

    const result = await sql`
      UPDATE styles
      SET
        name = COALESCE(${name ?? null}, name),
        fabric_json = COALESCE(${fabricJson ? JSON.stringify(fabricJson) : null}::jsonb, fabric_json),
        thumbnail = COALESCE(${thumbnail ?? null}, thumbnail),
        aspect_ratio = COALESCE(${aspectRatio ?? null}, aspect_ratio),
        updated_at = now()
      WHERE id = ${styleId}
      RETURNING id, code_id, name, fabric_json, aspect_ratio, thumbnail, created_at, updated_at
    `;

    return NextResponse.json({ style: result[0] });
  } catch (error) {
    console.error("PUT /api/styles/[styleId] error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { styleId } = await context.params;

    const existing = await sql`SELECT code_id FROM styles WHERE id = ${styleId}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Estilo no encontrado" }, { status: 404 });
    }

    const sessionCodeId = await getSessionCodeId();
    if (sessionCodeId !== existing[0].code_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await sql`DELETE FROM styles WHERE id = ${styleId}`;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/styles/[styleId] error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
