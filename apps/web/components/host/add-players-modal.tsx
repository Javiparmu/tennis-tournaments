"use client";

import type { AddPlayerInput, AddPlayersRequest } from "@courtrank/core/models";
import { Button, Form } from "@heroui/react";
import { useState } from "react";
import { inputClass, ModalShell } from "@/components/modal-shell";

type AddPlayersModalProps = {
  onClose: () => void;
  onSubmit: (payload: AddPlayersRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

// Optional trailing seed, "value, 3". Seeds are optional here: when omitted the
// backend seeds registered players by their Elo rating.
function splitSeed(line: string): { value: string; seed: number | null } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const [valuePart, seedPart] = trimmed.split(",").map((p) => p.trim());
  if (!valuePart) return null;
  const seed = seedPart ? Number(seedPart) : null;
  return { value: valuePart, seed: Number.isFinite(seed) && (seed ?? 0) > 0 ? seed : null };
}

// A registered player is added by email; the backend resolves it server-side, so
// no user list ever reaches the browser. A guest is a free-text external player.
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function AddPlayersModal({ onClose, onSubmit, isSubmitting, submitError }: AddPlayersModalProps) {
  const [emails, setEmails] = useState("");
  const [guests, setGuests] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Añadir jugadores"
      subtitle="Añade usuarios de CourtRank por correo o invitados externos por nombre."
      onClose={onClose}
      disabled={isSubmitting}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);

          const emailEntries = emails
            .split("\n")
            .map(splitSeed)
            .filter((e): e is { value: string; seed: number | null } => e != null);
          const invalidEmail = emailEntries.find((e) => !looksLikeEmail(e.value));
          if (invalidEmail) {
            setValidationError(`«${invalidEmail.value}» no es un correo válido.`);
            return;
          }

          const guestEntries = guests
            .split("\n")
            .map(splitSeed)
            .filter((g): g is { value: string; seed: number | null } => g != null);

          const players: AddPlayerInput[] = [
            ...emailEntries.map((e) => ({ email: e.value, seed: e.seed })),
            ...guestEntries.map((g) => ({ name: g.value, seed: g.seed })),
          ];
          if (players.length === 0) {
            setValidationError("Añade al menos un jugador por correo o como invitado.");
            return;
          }
          await onSubmit({ players });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Usuarios registrados (por correo)</span>
          <textarea
            rows={5}
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder={"ana@example.com\ncarlos@example.com, 3"}
            className={inputClass}
          />
          <span className="text-xs font-normal text-stone-500">
            Un correo por línea. Debe corresponder a una cuenta de CourtRank. El cabeza de serie es opcional (“correo,
            3”); si lo omites, se siembra por Elo.
          </span>
        </label>

        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>Invitados externos (por nombre)</span>
          <textarea
            rows={4}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder={"Roger Federer, 1\nJugador invitado"}
            className={inputClass}
          />
          <span className="text-xs font-normal text-stone-500">
            Un jugador por línea, sin cuenta en la plataforma. Añade un cabeza de serie con “Nombre, 3”.
          </span>
        </label>

        {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Añadir jugadores
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}
