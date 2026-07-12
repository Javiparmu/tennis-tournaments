"use client";

import { Button, Chip } from "@heroui/react";
import { useState } from "react";
import { FormError, inputClass, ModalShell } from "@/components/modal-shell";
import { VISIBILITY_LABEL } from "@courtrank/core/lib/labels";
import type { CreateRacketRequest, RacketSummary, RacketVisibility } from "@courtrank/core/models";

type RacketFormModalProps = {
  racket: RacketSummary | null | undefined;
  onClose: () => void;
  onSubmit: (payload: CreateRacketRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

type FormState = {
  displayName: string;
  brand: string;
  model: string;
  stringPattern: string;
  visibility: RacketVisibility;
};

function buildInitialState(racket: RacketSummary | null | undefined): FormState {
  return {
    displayName: racket?.displayName ?? "",
    brand: racket?.brand ?? "",
    model: racket?.model ?? "",
    stringPattern: racket?.stringPattern ?? "",
    visibility: racket?.visibility ?? "PRIVATE",
  };
}

export function RacketFormModal({ racket, onClose, onSubmit, isSubmitting, submitError }: RacketFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(racket));
  const [validationError, setValidationError] = useState<string | null>(null);

  if (racket === undefined) {
    return null;
  }

  const isEditing = racket != null;

  return (
    <ModalShell
      title={isEditing ? "Editar raqueta" : "Añadir raqueta"}
      subtitle="Da un nombre a tu raqueta, añade las especificaciones y elige su visibilidad."
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
          if (!form.displayName.trim()) {
            setValidationError("El nombre de la raqueta es obligatorio.");
            return;
          }
          await onSubmit({
            displayName: form.displayName.trim(),
            brand: form.brand.trim() || null,
            model: form.model.trim() || null,
            stringPattern: form.stringPattern.trim() || null,
            visibility: form.visibility,
          });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Nombre</span>
          <input
            required
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            placeholder="Mi Pro Staff"
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Marca</span>
            <input
              value={form.brand}
              onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
              placeholder="Wilson"
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Modelo</span>
            <input
              value={form.model}
              onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
              placeholder="Pro Staff 97"
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Patrón de cuerdas</span>
            <input
              value={form.stringPattern}
              onChange={(event) => setForm((current) => ({ ...current, stringPattern: event.target.value }))}
              placeholder="16x19"
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Visibilidad</span>
            <select
              value={form.visibility}
              onChange={(event) =>
                setForm((current) => ({ ...current, visibility: event.target.value as RacketVisibility }))
              }
              className={inputClass}
            >
              <option value="PRIVATE">Privada</option>
              <option value="PUBLIC">Pública</option>
            </select>
          </label>
        </div>

        <FormError message={validationError} />
        <FormError message={submitError} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            {isEditing ? "Guardar cambios" : "Crear raqueta"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
