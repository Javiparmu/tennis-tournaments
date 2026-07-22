"use client";

import { Show, useUser } from "@clerk/nextjs";
import { Button, Chip } from "@heroui/react";
import { Check, Clock, UserPlus } from "lucide-react";
import { useState } from "react";
import { useCreateJoinRequestMutation, useMyJoinRequestsQuery, useWithdrawJoinRequestMutation } from "@/data/queries";
import { errorMessage } from "@courtrank/core/lib/errors";
import type { TournamentJoinRequestStatus, TournamentStatus } from "@courtrank/core/models";

const STATUS_LABEL: Record<TournamentJoinRequestStatus, string> = {
  PENDING: "Solicitud pendiente",
  ACCEPTED: "¡Estás dentro!",
  REJECTED: "Solicitud rechazada",
  WITHDRAWN: "Solicitud retirada",
  EXPIRED: "Solicitud caducada",
};

// Statuses that block a fresh sign-up: an active request already exists.
const ACTIVE: TournamentJoinRequestStatus[] = ["PENDING", "ACCEPTED"];

const OPEN_STATUSES: TournamentStatus[] = ["DRAFT", "STARTED"];

export function JoinTournament({
  tournamentId,
  tournamentStatus,
}: {
  tournamentId: number;
  tournamentStatus: TournamentStatus;
}) {
  const { user } = useUser();
  const { data: requests = [] } = useMyJoinRequestsQuery();
  const create = useCreateJoinRequestMutation();
  const withdraw = useWithdrawJoinRequestMutation();
  const [note, setNote] = useState("");

  // Give the backend a real display name; otherwise it falls back to the synced
  // username, which can look like an id for accounts without a name set.
  const playerName = user?.fullName?.trim() || user?.username?.trim() || null;

  // Most recent request for this tournament (ids increase over time).
  const mine = requests.filter((r) => r.tournamentId === tournamentId).sort((a, b) => b.id - a.id)[0];

  const hasActive = mine != null && ACTIVE.includes(mine.status);
  const isOpen = OPEN_STATUSES.includes(tournamentStatus);

  return (
    <Show when="signed-in">
      <section className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-display text-lg font-bold">Inscripción</h2>

        {mine && (
          <Chip
            size="sm"
            variant="soft"
            className={
              mine.status === "ACCEPTED"
                ? "border border-court/30 bg-court/10 text-court"
                : mine.status === "PENDING"
                  ? "border border-ball/40 bg-ball/20 text-court"
                  : "border border-stone-200 bg-stone-100 text-stone-600"
            }
          >
            <span className="flex items-center gap-1.5">
              {mine.status === "ACCEPTED" ? (
                <Check className="h-3.5 w-3.5" />
              ) : mine.status === "PENDING" ? (
                <Clock className="h-3.5 w-3.5" />
              ) : null}
              {STATUS_LABEL[mine.status]}
            </span>
          </Chip>
        )}

        {hasActive ? (
          mine.status === "PENDING" ? (
            <div className="mt-3">
              <Button
                variant="outline"
                className="border-court/20 text-court-ink"
                onPress={() => withdraw.mutate({ id: tournamentId, requestId: mine.id })}
                isDisabled={withdraw.isPending}
              >
                Retirar solicitud
              </Button>
              {withdraw.error && (
                <p className="mt-2 text-sm text-rose-600">{errorMessage(withdraw.error, "joinRequest.withdraw")}</p>
              )}
            </div>
          ) : null
        ) : isOpen ? (
          <div className="mt-3 space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota opcional para el organizador"
              rows={2}
              className="w-full resize-none rounded-xl border border-court/15 bg-white px-3 py-2 text-sm outline-none focus:border-court/40"
            />
            <Button
              className="bg-court text-ball-bright hover:bg-court-hover"
              onPress={() =>
                create.mutate(
                  { id: tournamentId, payload: { playerName, note: note.trim() || null } },
                  { onSuccess: () => setNote("") },
                )
              }
              isDisabled={create.isPending}
            >
              <UserPlus className="mr-1 h-4 w-4" />
              {mine ? "Inscribirse de nuevo" : "Inscribirse para jugar"}
            </Button>
            {create.error && (
              <p className="text-sm text-rose-600">{errorMessage(create.error, "joinRequest.create")}</p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500">La inscripción está cerrada para este torneo.</p>
        )}
      </section>
    </Show>
  );
}
