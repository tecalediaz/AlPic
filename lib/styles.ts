import { sql } from "@/lib/db";
import type { StyleListItem } from "@/types";

export async function getStylesByCodeId(codeId: string): Promise<StyleListItem[]> {
  const rows = await sql`
    SELECT id, code_id, name, aspect_ratio, thumbnail, created_at, updated_at
    FROM styles
    WHERE code_id = ${codeId}
    ORDER BY created_at DESC
  `;

  return rows as StyleListItem[];
}
