import { redirect } from "next/navigation";
import { getSessionCodeId } from "@/lib/session";

interface PageProps {
  params: Promise<{ codeId: string }>;
}

export default async function StylesListPage({ params }: PageProps) {
  const { codeId } = await params;

  const sessionCodeId = await getSessionCodeId();
  if (sessionCodeId !== codeId) {
    redirect("/");
  }

  redirect(`/estilos/${codeId}`);
}
