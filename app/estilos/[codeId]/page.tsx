import { EstilosClient } from "@/components/estilos/EstilosClient";
import { LOCAL_WORKSPACE_ID } from "@/lib/local-styles";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ codeId: string }>;
}

export default async function EstilosPage({ params }: PageProps) {
  const { codeId } = await params;

  if (codeId !== LOCAL_WORKSPACE_ID) notFound();

  return <EstilosClient codeId={codeId} />;
}
