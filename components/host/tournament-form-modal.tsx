"use client";

import { Button, Form } from "@heroui/react";
import { useState } from "react";
import { inputClass, ModalShell } from "@/components/modal-shell";
import { SURFACE_LABEL } from "@/lib/surface";
import type { SurfaceType, TournamentBasic } from "@/models";

export type TournamentFormValues = {
  name: string;
  description: string | null;
  surface: SurfaceType | null;
  startDate: string; // ISO instant
  endDate: string; // ISO instant
};

type TournamentFormModalProps = {
  tournament: TournamentBasic | null;
  onClose: () => void;
  onSubmit: (values: TournamentFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

// ISO instant <-> <input type="datetime-local"> value (local time, no zone suffix).
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SURFACES: SurfaceType[] = ["CLAY", "HARD", "GRASS"];

export function TournamentFormModal({
  tournament,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}: TournamentFormModalProps) {
  const [name, setName] = useState(tournament?.name ?? "");
  const [description, setDescription] = useState(tournament?.description ?? "");
  const [surface, setSurface] = useState<string>(tournament?.surface ?? "");
  const [startDate, setStartDate] = useState(toLocalInput(tournament?.startDate ?? null));
  const [endDate, setEndDate] = useState(toLocalInput(tournament?.endDate ?? null));
  const [validationError, setValidationError] = useState<string | null>(null);
  const isEditing = tournament != null;

  return (
    <ModalShell
      title={isEditing ? "Editar torneo" : "Crear torneo"}
      subtitle="Los jugadores lo verán en el listado de torneos."
      onClose={onClose}
      disabled={isSubmitting}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          if (!name.trim()) {
            setValidationError("El nombre del torneo es obligatorio.");
            return;
          }
          if (!startDate || !endDate) {
            setValidationError("Las fechas de inicio y fin son obligatorias.");
            return;
          }
          if (new Date(endDate) < new Date(startDate)) {
            setValidationError("La fecha de fin debe ser posterior a la de inicio.");
            return;
          }
          await onSubmit({
            name: name.trim(),
            description: description.trim() || null,
            surface: (surface || null) as SurfaceType | null,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
          });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Nombre</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Open de Primavera 2026"
            className={inputClass}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Descripción</span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Formato, premios, contacto…"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Superficie</span>
            <select value={surface} onChange={(e) => setSurface(e.target.value)} className={inputClass}>
              <option value="">Sin especificar</option>
              {SURFACES.map((s) => (
                <option key={s} value={s}>
                  {SURFACE_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Inicio</span>
            <input
              required
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Fin</span>
            <input
              required
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            {isEditing ? "Guardar cambios" : "Crear torneo"}
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}
