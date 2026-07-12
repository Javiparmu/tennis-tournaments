import { Compass } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageScaffold } from "@/components/page-scaffold";

export default function NotFound() {
  return (
    <PageScaffold>
      <EmptyState
        icon={Compass}
        title="Página no encontrada"
        description="La página que buscas no existe o se ha movido."
        action={
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-court px-4 py-2 text-sm font-semibold text-ball-bright hover:bg-court-hover"
          >
            Volver al inicio
          </Link>
        }
      />
    </PageScaffold>
  );
}
