import { Button, Card, Chip } from "@heroui/react";
import { Lock, Target } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { VISIBILITY_LABEL } from "@/lib/labels";
import type { RacketSummary } from "@/models";

export function RacketsCard({
  rackets,
  isOwner,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onAddStringing,
  isMutating,
}: {
  rackets: RacketSummary[];
  isOwner: boolean;
  isLoading: boolean;
  onAdd?: () => void;
  onEdit?: (racket: RacketSummary) => void;
  onDelete?: (racket: RacketSummary) => void;
  onAddStringing?: (racket: RacketSummary) => void;
  isMutating?: boolean;
}) {
  const showActions = isOwner && Boolean(onEdit || onDelete || onAddStringing);

  return (
    <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
      <Card.Header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">{isOwner ? "Raquetas" : "Raquetas públicas"}</p>
          <p className="text-sm text-zinc-500">
            {isOwner
              ? "Las raquetas privadas solo se ven en tu propia página."
              : "Aquí solo aparecen las raquetas visibles públicamente."}
          </p>
        </div>
        {isOwner && onAdd ? (
          <Button className="bg-court text-ball-bright hover:bg-court-hover" onPress={onAdd}>
            Añadir raqueta
          </Button>
        ) : null}
      </Card.Header>
      <Card.Content className="gap-3 pt-0">
        {isLoading ? <p className="text-sm text-zinc-500">Cargando raquetas...</p> : null}
        {!isLoading && rackets.length === 0 ? (
          <EmptyState
            size="compact"
            icon={Target}
            title="Sin raquetas"
            description="No hay raquetas disponibles en esta vista."
          />
        ) : null}
        {rackets.map((racket) => (
          <div key={racket.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-zinc-900">{racket.displayName}</p>
                <p className="text-sm text-zinc-500">
                  {[racket.brand, racket.model, racket.stringPattern].filter(Boolean).join(" · ") ||
                    "Sin detalles de la raqueta"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && racket.visibility === "PRIVATE" ? <Lock className="h-4 w-4 text-zinc-500" /> : null}
                <Chip color={racket.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                  {VISIBILITY_LABEL[racket.visibility] ?? racket.visibility}
                </Chip>
              </div>
            </div>
            {racket.latestStringing ? (
              <p className="mt-3 text-sm text-zinc-600">
                Último encordado {racket.latestStringing.stringingDate} · {racket.latestStringing.mainsTensionKg}/
                {racket.latestStringing.crossesTensionKg} kg
              </p>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">Aún no hay historial de encordados.</p>
            )}
            {showActions ? (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-200 pt-3">
                {onAddStringing ? (
                  <Button size="sm" variant="ghost" className="text-court" onPress={() => onAddStringing(racket)}>
                    Añadir encordado
                  </Button>
                ) : null}
                {onEdit ? (
                  <Button size="sm" variant="ghost" className="text-zinc-700" onPress={() => onEdit(racket)}>
                    Editar
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600"
                    onPress={() => onDelete(racket)}
                    isDisabled={isMutating}
                  >
                    Eliminar
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}
