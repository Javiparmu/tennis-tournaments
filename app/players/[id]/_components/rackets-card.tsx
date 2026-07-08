import { Button, Chip } from "@heroui/react";
import { ArrowRight, History, Lock, Target } from "lucide-react";
import Link from "next/link";
import { DataCard } from "@/components/data-card";
import { EmptyState } from "@/components/empty-state";
import { VISIBILITY_LABEL } from "@/lib/labels";
import type { RacketSummary } from "@/models";

export function RacketsCard({
  rackets,
  isOwner,
  isLoading,
  subtitle,
  hideHeader,
  preview,
  previewLimit = 3,
  seeAllHref,
  onAdd,
  onEdit,
  onDelete,
  onOpenDetail,
  isMutating,
}: {
  rackets: RacketSummary[];
  isOwner: boolean;
  isLoading: boolean;
  subtitle?: string;
  /** Suppress the card title when the surrounding tab already names the section. */
  hideHeader?: boolean;
  /** Dashboard-preview mode: slim one-line rows, capped to `previewLimit`, with a
      "see all" link instead of the full editable cards. */
  preview?: boolean;
  previewLimit?: number;
  /** Where the "Ver todas" link points (e.g. the Raquetas tab) in preview mode. */
  seeAllHref?: string;
  onAdd?: () => void;
  onEdit?: (racket: RacketSummary) => void;
  onDelete?: (racket: RacketSummary) => void;
  onOpenDetail?: (racket: RacketSummary) => void;
  isMutating?: boolean;
}) {
  const addButton =
    isOwner && onAdd ? (
      <Button size="sm" className="bg-court text-ball-bright hover:bg-court-hover" onPress={onAdd}>
        Añadir
      </Button>
    ) : undefined;

  return (
    <DataCard
      icon={hideHeader ? undefined : Target}
      title={hideHeader ? undefined : isOwner ? "Raquetas" : "Raquetas públicas"}
      subtitle={hideHeader ? undefined : subtitle}
      action={hideHeader ? undefined : addButton}
    >
      {hideHeader && addButton ? <div className="mb-3 flex justify-end">{addButton}</div> : null}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : rackets.length === 0 ? (
        <EmptyState
          size="compact"
          icon={Target}
          title="Sin raquetas"
          description="No hay raquetas disponibles en esta vista."
        />
      ) : preview ? (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {rackets.slice(0, previewLimit).map((racket) => {
              const details =
                [racket.brand, racket.model, racket.stringPattern].filter(Boolean).join(" · ") ||
                "Sin detalles de la raqueta";
              return (
                <button
                  key={racket.id}
                  type="button"
                  onClick={() => onOpenDetail?.(racket)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-left transition hover:border-court/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{racket.displayName}</p>
                    <p className="truncate text-xs text-stone-500">{details}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {isOwner && racket.visibility === "PRIVATE" ? (
                      <Lock className="h-3.5 w-3.5 text-stone-400" aria-hidden />
                    ) : null}
                    <Chip size="sm" color={racket.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                      {VISIBILITY_LABEL[racket.visibility] ?? racket.visibility}
                    </Chip>
                  </div>
                </button>
              );
            })}
          </div>
          {seeAllHref && rackets.length > previewLimit ? (
            <Link
              href={seeAllHref}
              scroll={false}
              className="inline-flex items-center gap-1 text-sm font-semibold text-court transition-colors hover:text-court-hover"
            >
              Ver todas ({rackets.length})
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {rackets.map((racket) => (
            <div key={racket.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900">{racket.displayName}</p>
                  <p className="text-sm text-stone-500">
                    {[racket.brand, racket.model, racket.stringPattern].filter(Boolean).join(" · ") ||
                      "Sin detalles de la raqueta"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && racket.visibility === "PRIVATE" ? <Lock className="h-4 w-4 text-stone-500" /> : null}
                  <Chip color={racket.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                    {VISIBILITY_LABEL[racket.visibility] ?? racket.visibility}
                  </Chip>
                </div>
              </div>

              {racket.latestStringing ? (
                <p className="mt-3 text-sm text-stone-600">
                  Último encordado {racket.latestStringing.stringingDate} · {racket.latestStringing.mainsTensionKg}/
                  {racket.latestStringing.crossesTensionKg} kg
                </p>
              ) : (
                <p className="mt-3 text-sm text-stone-500">Aún no hay historial de encordados.</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-200 pt-3">
                {onOpenDetail ? (
                  <Button size="sm" variant="ghost" className="text-court" onPress={() => onOpenDetail(racket)}>
                    <History className="h-4 w-4" aria-hidden />
                    Ver encordados
                  </Button>
                ) : null}
                {isOwner && onEdit ? (
                  <Button size="sm" variant="ghost" className="text-stone-700" onPress={() => onEdit(racket)}>
                    Editar
                  </Button>
                ) : null}
                {isOwner && onDelete ? (
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
            </div>
          ))}
        </div>
      )}
    </DataCard>
  );
}
