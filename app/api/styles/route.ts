import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getStylesByCodeId } from "@/lib/styles";
import { getSessionCodeId } from "@/lib/session";
import type { AspectRatio } from "@/types";

const VALID_RATIOS: AspectRatio[] = ["1:1", "4:5", "9:16", "16:9", "1.91:1"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("codeId");

    if (!codeId) {
      return NextResponse.json({ error: "codeId requerido" }, { status: 400 });
    }

    const sessionCodeId = await getSessionCodeId();
    if (sessionCodeId !== codeId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const styles = await getStylesByCodeId(codeId);

    return NextResponse.json({ styles });
  } catch (error) {
    console.error("GET /api/styles error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const codeId = body.code_id as string;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const aspectRatio = body.aspect_ratio as AspectRatio;
    const fabricJson = body.fabric_json ?? {};
    const thumbnail = body.thumbnail ?? null;

    if (!codeId || !name) {
      return NextResponse.json({ error: "code_id y name son requeridos" }, { status: 400 });
    }

    if (!VALID_RATIOS.includes(aspectRatio)) {
      return NextResponse.json({ error: "aspect_ratio inválido" }, { status: 400 });
    }

    const sessionCodeId = await getSessionCodeId();
    if (sessionCodeId !== codeId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const codeExists = await sql`SELECT id FROM codes WHERE id = ${codeId}`;
    if (codeExists.length === 0) {
      return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
    }

    const result = await sql`
      INSERT INTO styles (code_id, name, fabric_json, aspect_ratio, thumbnail)
      VALUES (${codeId}, ${name}, ${JSON.stringify(fabricJson)}::jsonb, ${aspectRatio}, ${thumbnail})
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/styles error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
