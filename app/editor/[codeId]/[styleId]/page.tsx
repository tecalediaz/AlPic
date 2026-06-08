import { notFound, redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { EditorClient } from "@/components/canvas/EditorClient";
import { getSessionCodeId } from "@/lib/session";
import type { Style } from "@/types";

interface PageProps {
  params: Promise<{ codeId: string; styleId: string }>;
}

export default async function StyleEditorPage({ params }: PageProps) {
  const { codeId, styleId } = await params;

  const sessionCodeId = await getSessionCodeId();
  if (sessionCodeId !== codeId) {
    redirect("/");
  }

  const result = await sql`
    SELECT id, code_id, name, fabric_json, aspect_ratio, thumbnail, created_at, updated_at
    FROM styles
    WHERE id = ${styleId}
  `;

  if (result.length === 0) {
    notFound();
  }

  const style = result[0] as Style;

  if (style.code_id !== codeId) {
    notFound();
  }

  return <EditorClient codeId={codeId} styleId={styleId} initialStyle={style} />;
}
