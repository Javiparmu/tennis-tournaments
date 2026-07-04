"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import { FormError, inputClass, ModalShell } from "@/components/modal-shell";
import type { CreateRacketStringingRequest } from "@/models";
import { toLocalDayKey } from "./date-utils";

type StringingFormModalProps = {
  racketName: string;
  onClose: () => void;
  onSubmit: (payload: CreateRacketStringingRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

type FormState = {
  stringingDate: string;
  mainsTensionKg: string;
  crossesTensionKg: string;
  mainStringType: string;
  crossStringType: string;
  performanceNotes: string;
};

export function StringingFormModal({
  racketName,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: StringingFormModalProps) {
  const [form, setForm] = useState<FormState>(() => ({
    stringingDate: toLocalDayKey(new Date()),
    mainsTensionKg: "",
    crossesTensionKg: "",
    mainStringType: "",
    crossStringType: "",
    performanceNotes: "",
  }));
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Añadir encordado"
      subtitle={`Nuevo registro de encordado para ${racketName}.`}
      onClose={onClose}
      disabled={isSubmitting}
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          const mains = Number(form.mainsTensionKg);
          const crosses = Number(form.crossesTensionKg);
          if (!form.stringingDate) {
            setValidationError("La fecha de encordado es obligatoria.");
            return;
          }
          if (!Number.isFinite(mains) || mains <= 0 || !Number.isFinite(crosses) || crosses <= 0) {
            setValidationError("La tensión de verticales y horizontales debe ser mayor que 0.");
            return;
          }
          await onSubmit({
            stringingDate: form.stringingDate,
            mainsTensionKg: mains,
            crossesTensionKg: crosses,
            mainStringType: form.mainStringType.trim() || null,
            crossStringType: form.crossStringType.trim() || null,
            performanceNotes: form.performanceNotes.trim() || null,
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-zinc-700">
            <span>Fecha</span>
            <input
              required
              type="date"
              value={form.stringingDate}
              onChange={(event) => setForm((current) => ({ ...current, stringingDate: event.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700">
            <span>Verticales (kg)</span>
            <input
              required
              type="number"
              min="1"
              step="0.5"
              placeholder="23"
              value={form.mainsTensionKg}
              onChange={(event) => setForm((current) => ({ ...current, mainsTensionKg: event.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700">
            <span>Horizontales (kg)</span>
            <input
              required
              type="number"
              min="1"
              step="0.5"
              placeholder="22"
              value={form.crossesTensionKg}
              onChange={(event) => setForm((current) => ({ ...current, crossesTensionKg: event.target.value }))}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-zinc-700">
            <span>Cuerda vertical</span>
            <input
              value={form.mainStringType}
              onChange={(event) => setForm((current) => ({ ...current, mainStringType: event.target.value }))}
              placeholder="Luxilon ALU Power"
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700">
            <span>Cuerda horizontal</span>
            <input
              value={form.crossStringType}
              onChange={(event) => setForm((current) => ({ ...current, crossStringType: event.target.value }))}
              placeholder="Tripa natural"
              className={inputClass}
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Notas</span>
          <textarea
            rows={3}
            value={form.performanceNotes}
            onChange={(event) => setForm((current) => ({ ...current, performanceNotes: event.target.value }))}
            placeholder="¿Cómo jugó?"
            className={inputClass}
          />
        </label>

        <FormError message={validationError} />
        <FormError message={submitError} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Añadir encordado
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
