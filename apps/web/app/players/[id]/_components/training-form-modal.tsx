"use client";

import { Button, Chip } from "@heroui/react";
import { useState } from "react";
import { FormError, inputClass, ModalShell } from "@/components/modal-shell";
import { VISIBILITY_LABEL } from "@courtrank/core/lib/labels";
import type { CreateTrainingRequest, TrainingVisibility, UserTrainingEntry } from "@courtrank/core/models";
import { toLocalDayKey } from "./date-utils";

type TrainingFormModalProps = {
  training: UserTrainingEntry | null | undefined;
  onClose: () => void;
  onSubmit: (payload: CreateTrainingRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

type FormState = {
  trainingDate: string;
  durationMinutes: string;
  notes: string;
  visibility: TrainingVisibility;
};

function buildInitialState(training: UserTrainingEntry | null | undefined): FormState {
  return {
    trainingDate: training?.trainingDate ?? toLocalDayKey(new Date()),
    durationMinutes: training?.durationMinutes?.toString() ?? "",
    notes: training?.notes ?? "",
    visibility: training?.visibility ?? "PRIVATE",
  };
}

export function TrainingFormModal({ training, onClose, onSubmit, isSubmitting, submitError }: TrainingFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(training));
  const [validationError, setValidationError] = useState<string | null>(null);

  if (training === undefined) {
    return null;
  }

  const isEditing = training != null;

  return (
    <ModalShell
      title={isEditing ? "Editar sesión de entrenamiento" : "Añadir sesión de entrenamiento"}
      subtitle="Elige una fecha, anota el trabajo realizado y decide si es pública o privada."
      onClose={onClose}
      disabled={isSubmitting}
      headerExtra={
        <Chip variant="soft" color={form.visibility === "PUBLIC" ? "success" : "default"}>
          {VISIBILITY_LABEL[form.visibility] ?? form.visibility}
        </Chip>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);

          if (!form.trainingDate) {
            setValidationError("La fecha de entrenamiento es obligatoria.");
            return;
          }

          const durationMinutes = form.durationMinutes ? Number(form.durationMinutes) : null;
          if (durationMinutes != null && (!Number.isFinite(durationMinutes) || durationMinutes <= 0)) {
            setValidationError("La duración debe ser mayor que 0.");
            return;
          }

          await onSubmit({
            trainingDate: form.trainingDate,
            durationMinutes,
            notes: form.notes.trim() || null,
            visibility: form.visibility,
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Fecha del entrenamiento</span>
            <input
              required
              type="date"
              value={form.trainingDate}
              onChange={(event) => setForm((current) => ({ ...current, trainingDate: event.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Duración (minutos)</span>
            <input
              type="number"
              min="1"
              placeholder="90"
              value={form.durationMinutes}
              onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Visibilidad</span>
          <select
            value={form.visibility}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                visibility: event.target.value as TrainingVisibility,
              }))
            }
            className={inputClass}
          >
            <option value="PRIVATE">Privada</option>
            <option value="PUBLIC">Pública</option>
          </select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Notas</span>
          <textarea
            rows={5}
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            placeholder="¿En qué trabajaste?"
            className={inputClass}
          />
        </label>

        <FormError message={validationError} />
        <FormError message={submitError} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            {isEditing ? "Guardar cambios" : "Crear sesión"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
