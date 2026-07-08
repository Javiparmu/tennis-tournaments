"use client";

import { Button, Chip } from "@heroui/react";
import { ModalShell } from "@/components/modal-shell";
import { MATCH_STATUS_LABEL, PHASE_FORMAT_LABEL, RESULT_LABEL } from "@/lib/labels";
import { formatScore } from "@/lib/score";
import type { UserProfileMatchEntry } from "@/models";

type MatchModalProps = {
  match: UserProfileMatchEntry | null;
  onClose: () => void;
};

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
    <ModalShell
      title={match.tournament.name}
      subtitle={`Fase ${PHASE_FORMAT_LABEL[match.phase.format] ?? match.phase.format} · ronda ${match.phase.round}`}
      onClose={onClose}
      headerExtra={
        <Button variant="ghost" className="text-stone-700" onPress={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-5">
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
            {MATCH_STATUS_LABEL[match.status] ?? match.status}
          </Chip>
        </div>

        <div className="grid gap-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Rival</p>
            <p className="mt-1 font-medium text-stone-900">{match.opponent?.name ?? "Sin rival registrado"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              {match.completedAt ? "Finalizado" : "Programado"}
            </p>
            <p className="mt-1 font-medium text-stone-900">
              {primaryTime ? formatDateTime(primaryTime) : "Sin definir"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Pista</p>
            <p className="mt-1 font-medium text-stone-900">{match.court ?? "Sin asignar"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Resultado</p>
            <p className="mt-1 font-medium text-stone-900">{formatScore(match.score, match.status)}</p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
