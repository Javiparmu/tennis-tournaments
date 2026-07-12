"use client";

import { Button, Chip } from "@heroui/react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ModalShell } from "@/components/modal-shell";
import {
  useCreateStringingMutation,
  useDeleteStringingMutation,
  useMyRacketDetailsQuery,
  usePublicRacketDetailsQuery,
  useUpdateStringingMutation,
} from "@/data/queries";
import { errorMessage } from "@courtrank/core/lib/errors";
import { VISIBILITY_LABEL } from "@courtrank/core/lib/labels";
import type { CreateRacketStringingRequest, RacketStringingHistoryEntry, RacketSummary } from "@courtrank/core/models";
import { StringingFormModal } from "./stringing-form-modal";

const STRINGING_DATE = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });

function formatStringingDate(value: string) {
  return STRINGING_DATE.format(new Date(`${value}T12:00:00`));
}

function sortHistory(history: RacketStringingHistoryEntry[]) {
  return [...history].sort((left, right) => {
    if (left.stringingDate !== right.stringingDate) return right.stringingDate.localeCompare(left.stringingDate);
    return right.createdAt.localeCompare(left.createdAt);
  });
}

// The full stringing history for one racket — the thing that was missing entirely
// from the UI. Owners can add/edit/delete entries here; visitors see the read-only
// history of a public racket. All CRUD flows through the already-wired stringing
// mutations, so this is purely a new surface over existing data.
export function RacketDetailModal({
  racket,
  userId,
  isOwner,
  onClose,
}: {
  racket: RacketSummary;
  userId?: number;
  isOwner: boolean;
  onClose: () => void;
}) {
  const ownerQuery = useMyRacketDetailsQuery(racket.id, isOwner);
  const publicQuery = usePublicRacketDetailsQuery(isOwner ? undefined : userId, isOwner ? undefined : racket.id);
  const detail = isOwner ? ownerQuery.data : publicQuery.data;
  const isLoading = isOwner ? ownerQuery.isLoading : publicQuery.isLoading;
  const isError = isOwner ? ownerQuery.isError : publicQuery.isError;

  const createStringing = useCreateStringingMutation();
  const updateStringing = useUpdateStringingMutation();
  const deleteStringing = useDeleteStringingMutation();

  // `undefined` = form closed, `null` = adding, an entry = editing that entry.
  const [formEntry, setFormEntry] = useState<RacketStringingHistoryEntry | null | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<RacketStringingHistoryEntry | null>(null);

  // Fall back to the latest stringing from the summary while the detail loads so the
  // panel is never empty when we already know there is a stringing.
  const history = sortHistory(detail?.history ?? (racket.latestStringing ? [racket.latestStringing] : []));

  async function handleFormSubmit(payload: CreateRacketStringingRequest) {
    try {
      if (formEntry) {
        await updateStringing.mutateAsync({ racketId: racket.id, stringingId: formEntry.id, payload });
      } else {
        await createStringing.mutateAsync({ racketId: racket.id, payload });
      }
      setFormEntry(undefined);
    } catch {
      // Surfaced via the mutation objects; the form modal stays open.
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteStringing.mutateAsync({ racketId: racket.id, stringingId: pendingDelete.id });
      setPendingDelete(null);
    } catch {
      // Surfaced in the ConfirmDialog via the mutation object.
    }
  }

  const details = [racket.brand, racket.model, racket.stringPattern].filter(Boolean).join(" · ");
  const formError = createStringing.error ?? updateStringing.error;

  return (
    <>
      <ModalShell
        title={racket.displayName}
        subtitle={details || "Historial de encordados"}
        onClose={onClose}
        headerExtra={
          <div className="flex items-center gap-2">
            {isOwner && racket.visibility === "PRIVATE" ? <Lock className="h-4 w-4 text-stone-500" /> : null}
            <Chip color={racket.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
              {VISIBILITY_LABEL[racket.visibility] ?? racket.visibility}
            </Chip>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-stone-500">
              Historial de encordados
            </p>
            {isOwner ? (
              <Button
                size="sm"
                className="bg-court text-ball-bright hover:bg-court-hover"
                onPress={() => setFormEntry(null)}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Añadir
              </Button>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-rose-600">No se pudo cargar el historial de encordados.</p>
          ) : history.length === 0 ? (
            <EmptyState
              size="compact"
              icon={Pencil}
              title="Sin encordados"
              description={
                isOwner
                  ? "Añade el primer encordado para empezar el historial de esta raqueta."
                  : "Este jugador aún no ha registrado encordados en esta raqueta."
              }
            />
          ) : (
            <ol className="space-y-3">
              {history.map((stringing, index) => (
                <li
                  key={stringing.id}
                  className={`rounded-2xl border p-4 ${
                    index === 0 ? "border-court/30 bg-court/5" : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-stone-900">
                        {formatStringingDate(stringing.stringingDate)}
                        {index === 0 ? (
                          <span className="rounded-full bg-court px-2 py-0.5 text-[10px] font-semibold text-ball-bright">
                            Actual
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-stone-600">
                        {stringing.mainsTensionKg}/{stringing.crossesTensionKg} kg
                      </p>
                    </div>
                    {isOwner ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-stone-600"
                          onPress={() => setFormEntry(stringing)}
                          aria-label="Editar encordado"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600"
                          onPress={() => setPendingDelete(stringing)}
                          isDisabled={deleteStringing.isPending}
                          aria-label="Eliminar encordado"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  {stringing.mainStringType || stringing.crossStringType ? (
                    <p className="mt-2 text-sm text-stone-500">
                      {[stringing.mainStringType, stringing.crossStringType].filter(Boolean).join(" / ")}
                    </p>
                  ) : null}
                  {stringing.performanceNotes ? (
                    <p className="mt-1 text-sm text-stone-500">{stringing.performanceNotes}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </ModalShell>

      {formEntry !== undefined ? (
        <StringingFormModal
          key={formEntry?.id ?? "create-stringing"}
          racketName={racket.displayName}
          entry={formEntry}
          onClose={() => {
            createStringing.reset();
            updateStringing.reset();
            setFormEntry(undefined);
          }}
          onSubmit={handleFormSubmit}
          isSubmitting={createStringing.isPending || updateStringing.isPending}
          submitError={formError ? errorMessage(formError) : null}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar encordado"
        description={
          pendingDelete ? `¿Eliminar el encordado del ${formatStringingDate(pendingDelete.stringingDate)}?` : undefined
        }
        confirmLabel="Eliminar"
        isPending={deleteStringing.isPending}
        error={deleteStringing.error ? errorMessage(deleteStringing.error) : null}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          deleteStringing.reset();
          setPendingDelete(null);
        }}
      />
    </>
  );
}
