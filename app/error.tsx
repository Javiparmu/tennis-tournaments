"use client";

import { Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageScaffold } from "@/components/page-scaffold";

// Route-segment error boundary. Renders inside the root layout, so the header,
// footer, and providers are still available.
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageScaffold>
      <EmptyState
        icon={AlertTriangle}
        title="Algo ha salido mal"
        description="No hemos podido cargar esta sección. Puedes intentarlo de nuevo."
        action={
          <Button className="bg-court text-ball-bright hover:bg-court-hover" onPress={() => reset()}>
            Reintentar
          </Button>
        }
      />
    </PageScaffold>
  );
}
