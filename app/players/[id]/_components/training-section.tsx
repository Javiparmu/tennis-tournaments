import { Button, Card, Chip } from "@heroui/react";
import { Dumbbell } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { VISIBILITY_LABEL } from "@/lib/labels";
import type { UserTrainingEntry } from "@/models";
import { formatDateTime } from "./date-utils";

function formatTrainingDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function getTrainingDurationLabel(durationMinutes: number | null) {
  if (durationMinutes == null) return "Sin duración registrada";
  if (durationMinutes < 60) return `${durationMinutes} min`;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function TrainingSection({
  isOwner,
  trainings,
  onCreate,
  onEdit,
  onDelete,
  isDeleting,
}: {
  isOwner: boolean;
  trainings: UserTrainingEntry[];
  onCreate: () => void;
  onEdit: (training: UserTrainingEntry) => void;
  onDelete: (training: UserTrainingEntry) => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
      <Card.Content className="gap-3 p-5">
        {isOwner ? (
          <div className="flex justify-end">
            <Button size="sm" className="bg-court text-ball-bright hover:bg-court-hover" onPress={onCreate}>
              Añadir sesión
            </Button>
          </div>
        ) : null}
        {trainings.length === 0 ? (
          <EmptyState
            size="compact"
            icon={Dumbbell}
            title="Sin entrenamientos"
            description="No hay sesiones de entrenamiento registradas en este rango."
          />
        ) : null}
        {trainings.map((training) => (
          <div key={training.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-stone-900">{formatTrainingDate(training.trainingDate)}</p>
                  <Chip color="default" variant="soft">
                    {getTrainingDurationLabel(training.durationMinutes)}
                  </Chip>
                  <Chip color={training.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                    {VISIBILITY_LABEL[training.visibility] ?? training.visibility}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-stone-600">{training.notes ?? "No hay notas para esta sesión."}</p>
                <p className="mt-2 text-xs text-stone-400">
                  Registrado {formatDateTime(training.createdAt)}
                  {training.updatedAt ? ` · Actualizado ${formatDateTime(training.updatedAt)}` : ""}
                </p>
              </div>

              {isOwner ? (
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-stone-700" onPress={() => onEdit(training)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-rose-600"
                    onPress={() => onDelete(training)}
                    isDisabled={isDeleting}
                  >
                    Eliminar
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}
