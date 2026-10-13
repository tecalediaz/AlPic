import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ codeId: string }>;
}

export default async function StylesListPage({ params }: PageProps) {
  const { codeId } = await params;

  redirect(`/estilos/${codeId}`);
}
