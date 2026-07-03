"use client";

import { Button, Chip } from "@heroui/react";
import { Check, Inbox, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import {
  useAcceptJoinRequestMutation,
  useAllowResubmitJoinRequestMutation,
  useRejectJoinRequestMutation,
  useTournamentJoinRequestsQuery,
} from "@/data/queries";
import type { TournamentJoinRequestStatus } from "@/models";

const STATUS_STYLE: Record<TournamentJoinRequestStatus, string> = {
  PENDING: "border border-ball/40 bg-ball/20 text-court",
  ACCEPTED: "border border-court/30 bg-court/10 text-court",
  REJECTED: "border border-rose-200 bg-rose-50 text-rose-600",
  WITHDRAWN: "border border-zinc-200 bg-zinc-100 text-zinc-600",
  EXPIRED: "border border-zinc-200 bg-zinc-100 text-zinc-600",
};

const STATUS_LABEL: Record<TournamentJoinRequestStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  WITHDRAWN: "Retirada",
  EXPIRED: "Caducada",
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export function ManageJoinRequests({ tournamentId }: { tournamentId: number }) {
  const { data: requests = [], isLoading } = useTournamentJoinRequestsQuery(tournamentId);
  const accept = useAcceptJoinRequestMutation();
  const reject = useRejectJoinRequestMutation();
  const allowResubmit = useAllowResubmitJoinRequestMutation();

  const anyError = errorMessage(accept.error) ?? errorMessage(reject.error) ?? errorMessage(allowResubmit.error);
  const sorted = [...requests].sort((a, b) => b.id - a.id);

  return (
    <section className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-display text-lg font-bold">Solicitudes de inscripción</h2>

      {isLoading && <div className="h-16 animate-pulse rounded-xl bg-zinc-100/70" />}
      {!isLoading && sorted.length === 0 && (
        <EmptyState
          size="compact"
          icon={Inbox}
          title="Sin solicitudes"
          description="Las inscripciones de los jugadores aparecerán aquí."
        />
      )}

      <ul className="space-y-3">
        {sorted.map((req) => (
          <li key={req.id} className="rounded-xl bg-court/5 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-court-ink">{req.player.name}</p>
                {req.playerNote && <p className="mt-0.5 text-xs text-zinc-500">{req.playerNote}</p>}
              </div>
              <Chip size="sm" variant="soft" className={STATUS_STYLE[req.status]}>
                {STATUS_LABEL[req.status]}
              </Chip>
            </div>

            {req.status === "PENDING" && (
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  className="bg-court text-ball-bright hover:bg-court-hover"
                  onPress={() => accept.mutate({ id: tournamentId, requestId: req.id })}
                  isDisabled={accept.isPending}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-200 text-rose-600"
                  onPress={() => reject.mutate({ id: tournamentId, requestId: req.id })}
                  isDisabled={reject.isPending}
                >
                  <X className="mr-1 h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            )}

            {req.status === "REJECTED" && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 text-zinc-700"
                onPress={() => allowResubmit.mutate({ id: tournamentId, requestId: req.id })}
                isDisabled={allowResubmit.isPending}
              >
                Permitir reenvío
              </Button>
            )}
          </li>
        ))}
      </ul>

      {anyError && <p className="mt-2 text-sm text-rose-600">{anyError}</p>}
    </section>
  );
}
