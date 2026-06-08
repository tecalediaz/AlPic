import { buildStructuredData } from "@/lib/seo";

export function StructuredData() {
  const data = buildStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
