"use client";

import { Button, Form } from "@heroui/react";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { inputClass, ModalShell } from "@/components/modal-shell";
import type { Match, UpdateMatchScoreRequest } from "@/models";

type ScoreModalProps = {
  match: Match;
  onClose: () => void;
  onSubmit: (payload: UpdateMatchScoreRequest) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
};

type SetRow = { p1: string; p2: string; tb1: string; tb2: string };

function initialRows(match: Match): SetRow[] {
  if (match.score && match.score.sets.length > 0) {
    return match.score.sets.map((s) => ({
      p1: `${s.player1Games}`,
      p2: `${s.player2Games}`,
      tb1: s.tiebreak ? `${s.tiebreak.player1Points}` : "",
      tb2: s.tiebreak ? `${s.tiebreak.player2Points}` : "",
    }));
  }
  return [{ p1: "", p2: "", tb1: "", tb2: "" }];
}

export function ScoreModal({ match, onClose, onSubmit, isSubmitting, submitError }: ScoreModalProps) {
  const [rows, setRows] = useState<SetRow[]>(() => initialRows(match));
  const [validationError, setValidationError] = useState<string | null>(null);

  const name1 = match.player1?.name ?? "Jugador 1";
  const name2 = match.player2?.name ?? "Jugador 2";

  function update(index: number, patch: Partial<SetRow>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <ModalShell
      title="Resultado del partido"
      subtitle={`${name1} vs ${name2}`}
      onClose={onClose}
      disabled={isSubmitting}
    >
      <Form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setValidationError(null);
          const sets = [];
          for (const row of rows) {
            if (row.p1 === "" && row.p2 === "") continue;
            const g1 = Number(row.p1);
            const g2 = Number(row.p2);
            if (!Number.isInteger(g1) || g1 < 0 || !Number.isInteger(g2) || g2 < 0) {
              setValidationError("Cada set necesita un número de juegos válido.");
              return;
            }
            const hasTiebreak = row.tb1 !== "" && row.tb2 !== "";
            sets.push({
              player1Games: g1,
              player2Games: g2,
              tiebreak: hasTiebreak ? { player1Points: Number(row.tb1), player2Points: Number(row.tb2) } : null,
            });
          }
          if (sets.length === 0) {
            setValidationError("Añade al menos un set.");
            return;
          }
          await onSubmit({ score: { sets } });
        }}
      >
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          <span>Set</span>
          <span className="w-14 text-center">{name1.split(" ")[0]}</span>
          <span className="w-14 text-center">{name2.split(" ")[0]}</span>
          <span className="w-8" />
        </div>
        {rows.map((row, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional set rows
          <div key={index} className="space-y-2 rounded-xl bg-court/5 p-3">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
              <span className="text-sm font-medium text-stone-600">Set {index + 1}</span>
              <input
                type="number"
                min="0"
                value={row.p1}
                onChange={(e) => update(index, { p1: e.target.value })}
                className={`${inputClass} w-14 text-center`}
              />
              <input
                type="number"
                min="0"
                value={row.p2}
                onChange={(e) => update(index, { p2: e.target.value })}
                className={`${inputClass} w-14 text-center`}
              />
              <button
                type="button"
                aria-label="Eliminar set"
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="text-xs text-stone-400">Tie-break</span>
              <input
                type="number"
                min="0"
                placeholder="—"
                value={row.tb1}
                onChange={(e) => update(index, { tb1: e.target.value })}
                className={`${inputClass} w-14 text-center`}
              />
              <input
                type="number"
                min="0"
                placeholder="—"
                value={row.tb2}
                onChange={(e) => update(index, { tb2: e.target.value })}
                className={`${inputClass} w-14 text-center`}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setRows((current) => [...current, { p1: "", p2: "", tb1: "", tb2: "" }])}
          className="inline-flex items-center gap-1 text-sm font-medium text-court hover:text-court-hover"
        >
          <Plus className="h-4 w-4" />
          Añadir set
        </button>

        {validationError ? <p className="text-sm text-rose-600">{validationError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" className="text-stone-700" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-court text-ball-bright hover:bg-court-hover" isDisabled={isSubmitting}>
            Guardar resultado
          </Button>
        </div>
      </Form>
    </ModalShell>
  );
}
