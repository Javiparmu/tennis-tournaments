"use client";

import { Button, Chip } from "@heroui/react";
import { ArrowLeft, CalendarDays, Gauge, Pencil, Play, RotateCcw, Trophy, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AddPlayersModal } from "@/components/host/add-players-modal";
import { PhaseFormModal } from "@/components/host/phase-form-modal";
import { ScoreModal } from "@/components/host/score-modal";
import { TournamentFormModal, type TournamentFormValues } from "@/components/host/tournament-form-modal";
import { Bracket } from "@/components/tournament/bracket";
import { JoinTournament } from "@/components/tournament/join-tournament";
import { ManageJoinRequests } from "@/components/tournament/manage-join-requests";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  useAddTournamentPlayersMutation,
  useCanManageClub,
  useCreatePhaseMutation,
  useRemoveTournamentPlayerMutation,
  useResetTournamentMutation,
  useStartTournamentMutation,
  useTournamentBracketQuery,
  useTournamentQuery,
  useUpdateMatchScoreMutation,
  useUpdateTournamentMutation,
} from "@/data/queries";
import { formatDateRange } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";
import type {
  AddPlayersRequest,
  CreatePhaseRequest,
  Match,
  PhaseConfiguration,
  TournamentStatus,
  UpdateMatchScoreRequest,
} from "@/models";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

const STATUS_STYLE: Record<TournamentStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 border-zinc-200",
  STARTED: "bg-ball/20 text-court border-court/30",
  COMPLETED: "bg-court/10 text-court border-court/30",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-200",
  ABANDONED: "bg-rose-50 text-rose-600 border-rose-200",
};

const STATUS_LABEL: Record<TournamentStatus, string> = {
  DRAFT: "Borrador",
  STARTED: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  ABANDONED: "Abandonado",
};

const PHASE_FORMAT_LABEL: Record<string, string> = {
  KNOCKOUT: "Eliminatoria",
  GROUP: "Grupos",
  SWISS: "Suizo",
};

const SEEDING_LABEL: Record<string, string> = {
  INPUT_ORDER: "orden de entrada",
  RANDOM: "aleatorio",
  PARTIAL_SEEDED: "parcialmente sembrado",
};

function describeConfig(config: PhaseConfiguration): string {
  switch (config.type) {
    case "knockout":
      return `${config.qualifiers} clasificado(s) · ${SEEDING_LABEL[config.seedingStrategy] ?? config.seedingStrategy.toLowerCase()}${
        config.thirdPlacePlayoff ? " · partido por el 3er puesto" : ""
      }`;
    case "group":
      return `${config.groupCount} grupos · ${config.teamsPerGroup}/grupo · ${config.advancingPerGroup} avanzan`;
    case "swiss":
      return `${config.pointsPerWin} pts/victoria${config.advancingCount != null ? ` · ${config.advancingCount} avanzan` : ""}`;
  }
}

export default function TournamentDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const isValid = Number.isInteger(id) && id > 0;

  const tournamentQuery = useTournamentQuery(isValid ? id : undefined);
  const bracketQuery = useTournamentBracketQuery(isValid ? id : undefined);
  const tournament = tournamentQuery.data;
  const canManage = useCanManageClub(tournament?.clubId);

  const updateTournament = useUpdateTournamentMutation();
  const startTournament = useStartTournamentMutation();
  const resetTournament = useResetTournamentMutation();
  const addPlayers = useAddTournamentPlayersMutation();
  const removePlayer = useRemoveTournamentPlayerMutation();
  const createPhase = useCreatePhaseMutation();
  const updateScore = useUpdateMatchScoreMutation(isValid ? id : undefined);

  const [editing, setEditing] = useState(false);
  const [addingPlayers, setAddingPlayers] = useState(false);
  const [addingPhase, setAddingPhase] = useState(false);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);

  async function handleEdit(values: TournamentFormValues) {
    try {
      await updateTournament.mutateAsync({ id, ...values });
      setEditing(false);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleAddPlayers(payload: AddPlayersRequest) {
    try {
      await addPlayers.mutateAsync({ id, payload });
      setAddingPlayers(false);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleCreatePhase(payload: CreatePhaseRequest) {
    try {
      await createPhase.mutateAsync({ id, payload });
      setAddingPhase(false);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleScore(payload: UpdateMatchScoreRequest) {
    if (!scoringMatch) return;
    try {
      await updateScore.mutateAsync({ id: scoringMatch.id, payload });
      setScoringMatch(null);
    } catch {
      // surfaced via mutation error
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Link
          href="/tournaments"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-court"
        >
          <ArrowLeft className="h-4 w-4" />
          Todos los torneos
        </Link>

        {!isValid && <p className="text-rose-600">Identificador de torneo no válido.</p>}
        {isValid && tournamentQuery.isLoading && (
          <div className="h-40 animate-pulse rounded-3xl border border-zinc-100 bg-zinc-100/70" />
        )}
        {isValid && (tournamentQuery.error || (!tournamentQuery.isLoading && !tournament)) && (
          <p className="text-rose-600">No se pudo cargar este torneo.</p>
        )}

        {tournament && (
          <>
            <div className="relative overflow-hidden rounded-3xl border border-court/10 bg-white p-8 shadow-sm">
              <div className="court-lines absolute inset-0 -z-10 opacity-60" />
              <div className="glow absolute -right-16 -top-20 -z-10 h-56 w-56" />
              <div className="flex flex-wrap items-center gap-2">
                {tournament.surface && (
                  <Chip
                    size="sm"
                    variant="soft"
                    className={(() => {
                      const s = surfaceStyle(tournament.surface);
                      return `${s.bg} ${s.text} border ${s.border}`;
                    })()}
                  >
                    {surfaceStyle(tournament.surface).label}
                  </Chip>
                )}
                <Chip size="sm" variant="soft" className={`border ${STATUS_STYLE[tournament.status]}`}>
                  {STATUS_LABEL[tournament.status]}
                </Chip>
              </div>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">{tournament.name}</h1>
              {tournament.description && <p className="mt-3 max-w-2xl text-zinc-600">{tournament.description}</p>}
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-court" />
                  {formatDateRange(tournament.startDate, tournament.endDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-court" />
                  {(tournament.players ?? []).length} jugadores
                </span>
                <span className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-court" />
                  {(tournament.phases ?? []).length} fases
                </span>
                <span className="flex items-center gap-2">Club #{tournament.clubId}</span>
              </div>

              {canManage ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-court/10 pt-4">
                  <Button className="bg-court text-ball-bright hover:bg-court-hover" onPress={() => setEditing(true)}>
                    <Pencil className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                  {tournament.status === "DRAFT" ? (
                    <Button
                      variant="outline"
                      className="border-court/20 text-court-ink"
                      onPress={() => startTournament.mutate(id)}
                      isDisabled={startTournament.isPending}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Empezar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="border-court/20 text-court-ink"
                      onPress={() => {
                        if (window.confirm("¿Reiniciar este torneo? Se borrarán los partidos y el progreso.")) {
                          resetTournament.mutate(id);
                        }
                      }}
                      isDisabled={resetTournament.isPending}
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Reiniciar
                    </Button>
                  )}
                  <Button variant="ghost" className="text-zinc-700" onPress={() => setAddingPlayers(true)}>
                    <Users className="mr-1 h-4 w-4" />
                    Añadir jugadores
                  </Button>
                  <Button variant="ghost" className="text-zinc-700" onPress={() => setAddingPhase(true)}>
                    <Gauge className="mr-1 h-4 w-4" />
                    Añadir fase
                  </Button>
                </div>
              ) : null}
              {(startTournament.error || resetTournament.error) && (
                <p className="mt-2 text-sm text-rose-600">
                  {errorMessage(startTournament.error) ?? errorMessage(resetTournament.error)}
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
              <aside className="space-y-6">
                {!canManage && (
                  <JoinTournament tournamentId={id} tournamentStatus={tournament.status} />
                )}
                {canManage && <ManageJoinRequests tournamentId={id} />}
                <section className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 font-display text-lg font-bold">Jugadores</h2>
                  {(tournament.players ?? []).length === 0 ? (
                    <p className="text-sm text-zinc-500">Aún no hay jugadores inscritos.</p>
                  ) : (
                    <ul className="space-y-2">
                      {(tournament.players ?? []).map((player) => (
                        <li key={player.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2">
                            {tournament.championPlayerId === player.id && (
                              <Trophy className="h-4 w-4 text-court" />
                            )}
                            {player.user ? (
                              <Link href={`/users/${encodeURIComponent(player.user.username)}`} className="hover:text-court">
                                {player.name}
                              </Link>
                            ) : (
                              player.name
                            )}
                          </span>
                          <span className="flex items-center gap-2">
                            {player.seed != null && <span className="text-xs text-zinc-400">#{player.seed}</span>}
                            {canManage ? (
                              <button
                                type="button"
                                aria-label={`Eliminar ${player.name}`}
                                onClick={() => removePlayer.mutate({ id, playerId: player.id })}
                                className="text-zinc-300 hover:text-rose-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 font-display text-lg font-bold">Fases</h2>
                  {(tournament.phases ?? []).length === 0 ? (
                    <p className="text-sm text-zinc-500">Aún no hay fases configuradas.</p>
                  ) : (
                    <ol className="space-y-3">
                      {(tournament.phases ?? []).map((phase) => (
                        <li key={phase.id} className="rounded-xl bg-court/5 p-3">
                          <p className="text-sm font-semibold text-court-ink">
                            {phase.phaseOrder}. {PHASE_FORMAT_LABEL[phase.format] ?? phase.format}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">{describeConfig(phase.configuration)}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </aside>

              <section>
                <h2 className="mb-4 font-display text-2xl font-black tracking-tight">Cuadro</h2>
                {bracketQuery.isLoading && (
                  <div className="h-48 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-100/70" />
                )}
                {bracketQuery.error && <p className="text-sm text-rose-600">No se pudo cargar el cuadro.</p>}
                {canManage && (
                  <p className="mb-3 text-sm text-zinc-500">Toca un partido para introducir o editar su resultado.</p>
                )}
                {bracketQuery.data && (
                  <Bracket
                    bracket={bracketQuery.data}
                    onSelectMatch={canManage ? setScoringMatch : undefined}
                  />
                )}
                {updateScore.error && <p className="mt-2 text-sm text-rose-600">{errorMessage(updateScore.error)}</p>}
              </section>
            </div>
          </>
        )}
      </main>
      <SiteFooter />

      {editing && tournament ? (
        <TournamentFormModal
          tournament={tournament}
          onClose={() => {
            updateTournament.reset();
            setEditing(false);
          }}
          onSubmit={handleEdit}
          isSubmitting={updateTournament.isPending}
          submitError={errorMessage(updateTournament.error)}
        />
      ) : null}
      {addingPlayers ? (
        <AddPlayersModal
          onClose={() => {
            addPlayers.reset();
            setAddingPlayers(false);
          }}
          onSubmit={handleAddPlayers}
          isSubmitting={addPlayers.isPending}
          submitError={errorMessage(addPlayers.error)}
        />
      ) : null}
      {addingPhase && tournament ? (
        <PhaseFormModal
          defaultOrder={(tournament.phases ?? []).length + 1}
          onClose={() => {
            createPhase.reset();
            setAddingPhase(false);
          }}
          onSubmit={handleCreatePhase}
          isSubmitting={createPhase.isPending}
          submitError={errorMessage(createPhase.error)}
        />
      ) : null}
      {scoringMatch ? (
        <ScoreModal
          match={scoringMatch}
          onClose={() => {
            updateScore.reset();
            setScoringMatch(null);
          }}
          onSubmit={handleScore}
          isSubmitting={updateScore.isPending}
          submitError={errorMessage(updateScore.error)}
        />
      ) : null}
    </div>
  );
}
