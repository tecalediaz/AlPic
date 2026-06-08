import { redirect } from "next/navigation";
import { EstilosClient } from "@/components/estilos/EstilosClient";
import { getSessionCodeId } from "@/lib/session";

interface PageProps {
  params: Promise<{ codeId: string }>;
}

export default async function EstilosPage({ params }: PageProps) {
  const { codeId } = await params;

  const sessionCodeId = await getSessionCodeId();
  if (sessionCodeId !== codeId) {
    redirect("/");
  }

  return <EstilosClient codeId={codeId} />;
}
