"use client";

import { Button, Card, Chip } from "@heroui/react";
import { useState } from "react";
import { VISIBILITY_LABEL } from "@/lib/labels";
import type { CreateRacketRequest, RacketSummary, RacketVisibility } from "@/models";

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

const inputClass =
  "w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-court";

export function RacketFormModal({ racket, onClose, onSubmit, isSubmitting, submitError }: RacketFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(racket));
  const [validationError, setValidationError] = useState<string | null>(null);

  if (racket === undefined) {
    return null;
  }

  const isEditing = racket != null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-8">
      <button
        type="button"
        aria-label="Cerrar formulario de raqueta"
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        disabled={isSubmitting}
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-xl rounded-2xl border border-court/10 bg-white shadow-2xl">
        <Card.Header className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            <p className="font-display text-lg font-bold">{isEditing ? "Editar raqueta" : "Añadir raqueta"}</p>
            <p className="text-sm text-zinc-500">Da un nombre a tu raqueta, añade las especificaciones y elige su visibilidad.</p>
          </div>
          <Chip variant="soft" color={form.visibility === "PUBLIC" ? "success" : "default"}>
            {VISIBILITY_LABEL[form.visibility] ?? form.visibility}
          </Chip>
        </Card.Header>
        <Card.Content className="p-5">
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
            <label className="block space-y-2 text-sm font-medium text-zinc-700">
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
              <label className="space-y-2 text-sm font-medium text-zinc-700">
                <span>Marca</span>
                <input
                  value={form.brand}
                  onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                  placeholder="Wilson"
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-zinc-700">
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
              <label className="space-y-2 text-sm font-medium text-zinc-700">
                <span>Patrón de cuerdas</span>
                <input
                  value={form.stringPattern}
                  onChange={(event) => setForm((current) => ({ ...current, stringPattern: event.target.value }))}
                  placeholder="16x19"
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-zinc-700">
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

            {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
            {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
                {isEditing ? "Guardar cambios" : "Crear raqueta"}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
