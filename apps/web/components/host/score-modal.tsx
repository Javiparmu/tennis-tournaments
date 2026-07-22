"use client";

import { inferScoreWinnerId } from "@courtrank/core/lib/match-results";
import type { Match, UpdateMatchScoreRequest } from "@courtrank/core/models";
import { Button, Form } from "@heroui/react";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { inputClass, ModalShell } from "@/components/modal-shell";

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
  const previewSets = rows
    .filter((row) => row.p1 !== "" || row.p2 !== "")
    .map((row) => ({
      player1Games: Number(row.p1),
      player2Games: Number(row.p2),
      tiebreak:
        row.tb1 !== "" && row.tb2 !== "" ? { player1Points: Number(row.tb1), player2Points: Number(row.tb2) } : null,
    }))
    .filter(
      (set) =>
        Number.isInteger(set.player1Games) &&
        set.player1Games >= 0 &&
        Number.isInteger(set.player2Games) &&
        set.player2Games >= 0,
    );
  const previewWinnerId =
    previewSets.length > 0 && previewSets.length === rows.filter((row) => row.p1 !== "" || row.p2 !== "").length
      ? inferScoreWinnerId(match, { sets: previewSets })
      : null;
  const previewWinnerName =
    previewWinnerId === match.player1?.id ? name1 : previewWinnerId === match.player2?.id ? name2 : null;

  function buildPayload(): UpdateMatchScoreRequest | null {
    const sets: UpdateMatchScoreRequest["score"]["sets"] = [];
    for (const row of rows) {
      if (row.p1 === "" && row.p2 === "") continue;
      const g1 = Number(row.p1);
      const g2 = Number(row.p2);
      const tb1 = row.tb1 === "" ? null : Number(row.tb1);
      const tb2 = row.tb2 === "" ? null : Number(row.tb2);
      if (!Number.isInteger(g1) || g1 < 0 || !Number.isInteger(g2) || g2 < 0) {
        setValidationError("Cada set necesita un número de juegos válido.");
        return null;
      }
      if ((tb1 == null) !== (tb2 == null)) {
        setValidationError("Completa los dos valores del tie-break o deja ambos vacíos.");
        return null;
      }
      if (
        (tb1 != null && (!Number.isInteger(tb1) || tb1 < 0)) ||
        (tb2 != null && (!Number.isInteger(tb2) || tb2 < 0))
      ) {
        setValidationError("El tie-break necesita puntos válidos.");
        return null;
      }
      sets.push({
        player1Games: g1,
        player2Games: g2,
        tiebreak: tb1 != null && tb2 != null ? { player1Points: tb1, player2Points: tb2 } : null,
      });
    }
    if (sets.length === 0) {
      setValidationError("Añade al menos un set.");
      return null;
    }

    const payload = { score: { sets } };
    const winnerId = inferScoreWinnerId(match, payload.score);
    if (winnerId == null) {
      setValidationError("El marcador debe dejar un ganador claro.");
      return null;
    }
    return { ...payload, winnerId };
  }

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
          if (!match.player1 || !match.player2) {
            setValidationError("El partido necesita dos jugadores asignados.");
            return;
          }
          const payload = buildPayload();
          if (!payload) return;
          await onSubmit(payload);
        }}
      >
        <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          <span>Set</span>
          <span className="truncate text-center">{name1.split(" ")[0]}</span>
          <span className="truncate text-center">{name2.split(" ")[0]}</span>
          <span className="w-8" />
        </div>
        {rows.map((row, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional set rows
          <div key={index} className="rounded-xl bg-court/5 p-3">
            <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-2">
              <span className="text-sm font-medium text-stone-600">{index + 1}</span>
              <input
                type="number"
                min="0"
                value={row.p1}
                onChange={(e) => update(index, { p1: e.target.value })}
                className={`${inputClass} h-10 rounded-xl text-center`}
                aria-label={`Juegos de ${name1} en el set ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                value={row.p2}
                onChange={(e) => update(index, { p2: e.target.value })}
                className={`${inputClass} h-10 rounded-xl text-center`}
                aria-label={`Juegos de ${name2} en el set ${index + 1}`}
              />
              <button
                type="button"
                aria-label="Eliminar set"
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-stone-400 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-2">
              <span className="text-xs text-stone-400">TB</span>
              <input
                type="number"
                min="0"
                placeholder="-"
                value={row.tb1}
                onChange={(e) => update(index, { tb1: e.target.value })}
                className={`${inputClass} h-10 rounded-xl text-center`}
                aria-label={`Puntos de tie-break de ${name1} en el set ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                placeholder="-"
                value={row.tb2}
                onChange={(e) => update(index, { tb2: e.target.value })}
                className={`${inputClass} h-10 rounded-xl text-center`}
                aria-label={`Puntos de tie-break de ${name2} en el set ${index + 1}`}
              />
              <span />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setRows((current) => [...current, { p1: "", p2: "", tb1: "", tb2: "" }])}
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-court hover:text-court-hover"
        >
          <Plus className="h-4 w-4" />
          Añadir set
        </button>

        {previewWinnerName ? (
          <p className="rounded-xl border border-court/10 bg-white px-3 py-2 text-sm font-medium text-court">
            Ganador: {previewWinnerName}
          </p>
        ) : null}

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
