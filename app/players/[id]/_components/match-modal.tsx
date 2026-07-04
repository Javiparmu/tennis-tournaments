"use client";

import { Button, Card, Chip } from "@heroui/react";
import type { UserProfileMatchEntry } from "@/models";

type MatchModalProps = {
  match: UserProfileMatchEntry | null;
  onClose: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programado",
  LIVE: "En juego",
  COMPLETED: "Finalizado",
  WALKOVER: "W.O.",
};

const RESULT_LABEL: Record<string, string> = {
  WIN: "Victoria",
  LOSS: "Derrota",
};

const PHASE_FORMAT_LABEL: Record<string, string> = {
  KNOCKOUT: "Eliminatoria",
  GROUP: "Grupos",
  SWISS: "Suizo",
};

function formatScore(match: UserProfileMatchEntry) {
  if (!match.score) {
    return match.status === "WALKOVER" ? "W.O." : "Sin resultado registrado";
  }

  return match.score.sets
    .map((set) => {
      const tiebreak = set.tiebreak ? ` (${set.tiebreak.player1Points}-${set.tiebreak.player2Points})` : "";
      return `${set.player1Games}-${set.player2Games}${tiebreak}`;
    })
    .join("  ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  if (!match) {
    return null;
  }

  const primaryTime = match.completedAt ?? match.scheduledTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-8">
      <button
        type="button"
        aria-label="Cerrar detalles del partido"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-xl rounded-2xl border border-court/10 bg-white shadow-2xl">
        <Card.Header className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            <p className="font-display text-lg font-bold">{match.tournament.name}</p>
            <p className="text-sm text-zinc-500">
              Fase {PHASE_FORMAT_LABEL[match.phase.format] ?? match.phase.format} · ronda {match.phase.round}
            </p>
          </div>
          <Button variant="ghost" className="text-zinc-700" onPress={onClose}>
            Cerrar
          </Button>
        </Card.Header>
        <Card.Content className="gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {match.result ? (
              <Chip color={match.result === "WIN" ? "success" : "danger"} variant="soft">
                {RESULT_LABEL[match.result] ?? match.result}
              </Chip>
            ) : null}
            <Chip
              variant="soft"
              color={match.status === "WALKOVER" ? "warning" : match.status === "LIVE" ? "warning" : "default"}
            >
              {STATUS_LABEL[match.status] ?? match.status}
            </Chip>
          </div>

          <div className="grid gap-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Rival</p>
              <p className="mt-1 font-medium text-zinc-900">{match.opponent?.name ?? "Sin rival registrado"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {match.completedAt ? "Finalizado" : "Programado"}
              </p>
              <p className="mt-1 font-medium text-zinc-900">{primaryTime ? formatDateTime(primaryTime) : "Sin definir"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Pista</p>
              <p className="mt-1 font-medium text-zinc-900">{match.court ?? "Sin asignar"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Resultado</p>
              <p className="mt-1 font-medium text-zinc-900">{formatScore(match)}</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
