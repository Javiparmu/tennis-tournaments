"use client";

import { Button, Form } from "@heroui/react";
import { useState } from "react";
import type { AddPlayersRequest } from "@/models";
import { ModalShell, inputClass } from "@/components/modal-shell";

type AddPlayersModalProps = {
  onClose: () => void;
  onSubmit: (payload: AddPlayersRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

// ponytail: one player name per line. Optional seed as "Name, 3". Existing-player
// selection / external linking can come later if needed.
function parseLine(line: string): { name: string; seed: number | null } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const [namePart, seedPart] = trimmed.split(",").map((p) => p.trim());
  if (!namePart) return null;
  const seed = seedPart ? Number(seedPart) : null;
  return { name: namePart, seed: Number.isFinite(seed) && (seed ?? 0) > 0 ? seed : null };
}

export function AddPlayersModal({ onClose, onSubmit, isSubmitting, submitError }: AddPlayersModalProps) {
  const [text, setText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Añadir jugadores"
      subtitle="Un jugador por línea. Añade un cabeza de serie con “Nombre, 3”."
      onClose={onClose}
      disabled={isSubmitting}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          const players = text
            .split("\n")
            .map(parseLine)
            .filter((p): p is { name: string; seed: number | null } => p != null);
          if (players.length === 0) {
            setValidationError("Añade al menos un jugador.");
            return;
          }
          await onSubmit({ players });
        }}
      >
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Roger Federer, 1\nRafael Nadal, 2\nCarlos Alcaraz"}
          className={inputClass}
        />

        {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-zinc-700" onPress={onClose} isDisabled={isSubmitting}>
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
