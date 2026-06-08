import { notFound, redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { PhotoWorkspaceClient } from "@/components/workspace/PhotoWorkspaceClient";
import { getSessionCodeId } from "@/lib/session";
import type { Style } from "@/types";

interface PageProps {
  params: Promise<{ codeId: string; styleId: string }>;
}

export default async function PhotoWorkspacePage({ params }: PageProps) {
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

  return <PhotoWorkspaceClient codeId={codeId} style={style} />;
}
