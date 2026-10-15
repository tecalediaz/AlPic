import { EstilosClient } from "@/components/estilos/EstilosClient";
import { DesktopOnlyGate } from "@/components/layout/DesktopOnlyGate";
import { LOCAL_WORKSPACE_ID } from "@/lib/local-styles";

export default function HomePage() {
  return (
    <DesktopOnlyGate>
      <EstilosClient codeId={LOCAL_WORKSPACE_ID} />
    </DesktopOnlyGate>
  );
}
