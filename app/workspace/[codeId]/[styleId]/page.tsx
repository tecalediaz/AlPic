import { LocalStylePage } from "@/components/local/LocalStylePage";

interface PageProps {
  params: Promise<{ codeId: string; styleId: string }>;
}

export default async function PhotoWorkspacePage({ params }: PageProps) {
  const { codeId, styleId } = await params;

  return <LocalStylePage codeId={codeId} styleId={styleId} mode="workspace" />;
}
