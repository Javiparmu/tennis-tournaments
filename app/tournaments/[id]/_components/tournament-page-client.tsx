"use client";

import { Button, Chip } from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleAlert,
  Gauge,
  Layers,
  Pencil,
  Play,
  RotateCcw,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { AddPlayersModal } from "@/components/host/add-players-modal";
import { PhaseFormModal } from "@/components/host/phase-form-modal";
import { ScoreModal } from "@/components/host/score-modal";
import { TournamentFormModal, type TournamentFormValues } from "@/components/host/tournament-form-modal";
import { PageHeroFrame } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
import { Bracket } from "@/components/tournament/bracket";
import { JoinTournament } from "@/components/tournament/join-tournament";
import { ManageJoinRequests } from "@/components/tournament/manage-join-requests";
import {
  useAddTournamentPlayersMutation,
  useCanManageClub,
  useClubNameMap,
  useCreatePhaseMutation,
  useRemoveTournamentPlayerMutation,
  useResetTournamentMutation,
  useStartTournamentMutation,
  useTournamentBracketQuery,
  useTournamentPhasesQuery,
  useTournamentPlayersQuery,
  useTournamentQuery,
  useUpdateMatchScoreMutation,
  useUpdateTournamentMutation,
} from "@/data/queries";
import { errorMessage } from "@/lib/errors";
import { formatDateRange } from "@/lib/format";
import { PHASE_FORMAT_LABEL, TOURNAMENT_STATUS_LABEL } from "@/lib/labels";
import { computeStandings, type PlayerStatus } from "@/lib/standings";
import { surfaceStyle } from "@/lib/surface";
import type {
  AddPlayersRequest,
  CreatePhaseRequest,
  Match,
  PhaseConfiguration,
  UpdateMatchScoreRequest,
} from "@/models";

const SEEDING_LABEL: Record<string, string> = {
  INPUT_ORDER: "orden de entrada",
  RANDOM: "aleatorio",
  PARTIAL_SEEDED: "parcialmente sembrado",
};

function describeConfig(config: PhaseConfiguration): string {
  switch (config.type) {
    case "knockout": {
      // Backend omits fields at their default value, so treat them as optional.
      const qualifiers = config.qualifiers ?? 1;
      const seeding = config.seedingStrategy ?? "INPUT_ORDER";
      return `${qualifiers} clasificado(s) · ${SEEDING_LABEL[seeding] ?? seeding.toLowerCase()}${
        config.thirdPlacePlayoff ? " · partido por el 3er puesto" : ""
      }`;
    }
    case "group":
      return `${config.groupCount} grupos · ${config.teamsPerGroup}/grupo · ${config.advancingPerGroup} avanzan`;
    case "swiss":
      return `${config.pointsPerWin} pts/victoria${config.advancingCount != null ? ` · ${config.advancingCount} avanzan` : ""}`;
  }
}

const STANDING_STYLE: Record<PlayerStatus, string> = {
  champion: "bg-ball/20 text-court border-court/30",
  in: "bg-court/10 text-court border-court/30",
  out: "bg-rose-50 text-rose-600 border-rose-200",
  pending: "bg-stone-100 text-stone-500 border-stone-200",
};

const STANDING_LABEL: Record<PlayerStatus, string> = {
  champion: "Campeón",
  in: "En el torneo",
  out: "Eliminado",
  pending: "Pendiente",
};

export default function TournamentDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const isValid = Number.isInteger(id) && id > 0;

  const tournamentQuery = useTournamentQuery(isValid ? id : undefined);
  const bracketQuery = useTournamentBracketQuery(isValid ? id : undefined);
  const phasesQuery = useTournamentPhasesQuery(isValid ? id : undefined);
  const playersQuery = useTournamentPlayersQuery(isValid ? id : undefined);
  const tournament = tournamentQuery.data;
  const phases = phasesQuery.data ?? [];
  const players = playersQuery.data ?? [];
  const canManage = useCanManageClub(tournament?.clubId);
  const clubNames = useClubNameMap();

  const updateTournament = useUpdateTournamentMutation();
  const startTournament = useStartTournamentMutation();
  const resetTournament = useResetTournamentMutation();
  const addPlayers = useAddTournamentPlayersMutation();
  const removePlayer = useRemoveTournamentPlayerMutation();
  const createPhase = useCreatePhaseMutation();
  const updateScore = useUpdateMatchScoreMutation(isValid ? id : undefined);

  // Once a tournament is under way, show live standings (W-L + in/out) derived
  // from the bracket rather than a bare roster.
  const inProgress = tournament != null && tournament.status !== "DRAFT";
  const standings =
    tournament && inProgress
      ? computeStandings(
          players,
          bracketQuery.data?.phases.flatMap((phase) => phase.rounds.flatMap((round) => round.matches)) ?? [],
          tournament.championPlayerId,
        )
      : [];

  const [editing, setEditing] = useState(false);
  const [addingPlayers, setAddingPlayers] = useState(false);
  const [addingPhase, setAddingPhase] = useState(false);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  async function handleResetTournament() {
    try {
      await resetTournament.mutateAsync(id);
      setConfirmingReset(false);
    } catch {
      // surfaced in the dialog via resetTournament.error
    }
  }

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
    <PageScaffold>
      <Link
        href="/tournaments"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-court"
      >
        <ArrowLeft className="h-4 w-4" />
        Todos los torneos
      </Link>

      {!isValid && <p className="text-rose-600">Identificador de torneo no válido.</p>}
      {isValid && tournamentQuery.isLoading && (
        <div className="h-40 animate-pulse rounded-3xl border border-stone-100 bg-stone-100/70" />
      )}
      {isValid && (tournamentQuery.error || (!tournamentQuery.isLoading && !tournament)) && (
        <EmptyState
          icon={CircleAlert}
          title="No se pudo cargar este torneo"
          description="Puede que el torneo no exista o que haya un problema de conexión. Vuelve a intentarlo."
        />
      )}

      {tournament && (
        <>
          <PageHeroFrame className="p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              {tournament.surface && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ background: surfaceStyle(tournament.surface).hex }}
                  />
                  {surfaceStyle(tournament.surface).label}
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  tournament.status === "STARTED" ? "bg-ball-bright/15 text-ball-bright" : "bg-white/10 text-white/80"
                }`}
              >
                {TOURNAMENT_STATUS_LABEL[tournament.status]}
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">{tournament.name}</h1>
            {tournament.description && <p className="mt-3 max-w-2xl text-white/70">{tournament.description}</p>}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white/50" />
                {formatDateRange(tournament.startDate, tournament.endDate)}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white/50" />
                {players.length} jugadores
              </span>
              <span className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-white/50" />
                {phases.length} fases
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-white/50" />
                {clubNames.get(tournament.clubId) ?? "Club anfitrión"}
              </span>
            </div>

            {canManage ? (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <Button className="bg-ball-bright text-court-ink hover:bg-ball" onPress={() => setEditing(true)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Editar
                </Button>
                {tournament.status === "DRAFT" ? (
                  <Button
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10"
                    onPress={() => startTournament.mutate(id)}
                    isDisabled={startTournament.isPending}
                  >
                    <Play className="mr-1 h-4 w-4" />
                    Empezar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10"
                    onPress={() => setConfirmingReset(true)}
                    isDisabled={resetTournament.isPending}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reiniciar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white"
                  onPress={() => setAddingPlayers(true)}
                >
                  <Users className="mr-1 h-4 w-4" />
                  Añadir jugadores
                </Button>
                <Button variant="ghost" className="text-white/70 hover:text-white" onPress={() => setAddingPhase(true)}>
                  <Gauge className="mr-1 h-4 w-4" />
                  Añadir fase
                </Button>
              </div>
            ) : null}
            {startTournament.error && (
              <p className="mt-2 text-sm text-rose-300">{errorMessage(startTournament.error)}</p>
            )}
          </PageHeroFrame>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
            <aside className="space-y-6">
              {!canManage && <JoinTournament tournamentId={id} tournamentStatus={tournament.status} />}
              {canManage && <ManageJoinRequests tournamentId={id} />}
              <section className="rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-display text-lg font-bold">Jugadores</h2>
                {inProgress ? (
                  // Live standings: win-loss record and whether each player is
                  // still in the running, eliminated, or crowned champion.
                  standings.length === 0 ? (
                    <EmptyState
                      size="compact"
                      icon={Users}
                      title="Cuadro vacío"
                      description="Aún no hay jugadores en el cuadro."
                    />
                  ) : (
                    <ul className="space-y-2">
                      {standings.map(({ player, wins, losses, status }) => (
                        <li key={player.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            {status === "champion" && <Trophy className="h-4 w-4 shrink-0 text-court" />}
                            {player.user ? (
                              <Link
                                href={`/players/${encodeURIComponent(player.user.username)}`}
                                className="truncate hover:text-court"
                              >
                                {player.name}
                              </Link>
                            ) : (
                              <span className="truncate">{player.name}</span>
                            )}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="tabular-nums text-xs text-stone-500">
                              {wins}V · {losses}D
                            </span>
                            <Chip size="sm" variant="soft" className={`border ${STANDING_STYLE[status]}`}>
                              {STANDING_LABEL[status]}
                            </Chip>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                ) : players.length === 0 ? (
                  <EmptyState
                    size="compact"
                    icon={Users}
                    title="Sin jugadores"
                    description="Aún no hay jugadores inscritos."
                  />
                ) : (
                  <ul className="space-y-2">
                    {players.map((player) => (
                      <li key={player.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          {player.user ? (
                            <Link
                              href={`/players/${encodeURIComponent(player.user.username)}`}
                              className="hover:text-court"
                            >
                              {player.name}
                            </Link>
                          ) : (
                            player.name
                          )}
                        </span>
                        <span className="flex items-center gap-2">
                          {player.seed != null && <span className="text-xs text-stone-400">#{player.seed}</span>}
                          {canManage ? (
                            <button
                              type="button"
                              aria-label={`Eliminar ${player.name}`}
                              onClick={() => removePlayer.mutate({ id, playerId: player.id })}
                              className="rounded text-stone-300 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
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
                {phases.length === 0 ? (
                  <EmptyState
                    size="compact"
                    icon={Layers}
                    title="Sin fases"
                    description="Aún no hay fases configuradas."
                  />
                ) : (
                  <ol className="space-y-3">
                    {phases.map((phase) => (
                      <li key={phase.id} className="rounded-xl bg-court/5 p-3">
                        <p className="text-sm font-semibold text-court-ink">
                          {phase.phaseOrder}. {PHASE_FORMAT_LABEL[phase.format] ?? phase.format}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">{describeConfig(phase.configuration)}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </aside>

            <section>
              <h2 className="mb-4 font-display text-2xl font-black tracking-tight">Cuadro</h2>
              {bracketQuery.isLoading && (
                <div className="h-48 animate-pulse rounded-2xl border border-stone-100 bg-stone-100/70" />
              )}
              {bracketQuery.error && (
                <EmptyState
                  size="compact"
                  icon={CircleAlert}
                  title="No se pudo cargar el cuadro"
                  description="Vuelve a intentarlo en un momento."
                />
              )}
              {canManage && (
                <p className="mb-3 text-sm text-stone-500">Toca un partido para introducir o editar su resultado.</p>
              )}
              {bracketQuery.data && (
                <Bracket bracket={bracketQuery.data} onSelectMatch={canManage ? setScoringMatch : undefined} />
              )}
              {updateScore.error && <p className="mt-2 text-sm text-rose-600">{errorMessage(updateScore.error)}</p>}
            </section>
          </div>
        </>
      )}

      {editing && tournament ? (
        <TournamentFormModal
          tournament={tournament}
          onClose={() => {
            updateTournament.reset();
            setEditing(false);
          }}
          onSubmit={handleEdit}
          isSubmitting={updateTournament.isPending}
          submitError={updateTournament.error ? errorMessage(updateTournament.error) : null}
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
          submitError={addPlayers.error ? errorMessage(addPlayers.error) : null}
        />
      ) : null}
      {addingPhase && tournament ? (
        <PhaseFormModal
          defaultOrder={phases.length + 1}
          onClose={() => {
            createPhase.reset();
            setAddingPhase(false);
          }}
          onSubmit={handleCreatePhase}
          isSubmitting={createPhase.isPending}
          submitError={createPhase.error ? errorMessage(createPhase.error) : null}
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
          submitError={updateScore.error ? errorMessage(updateScore.error) : null}
        />
      ) : null}

      <ConfirmDialog
        open={confirmingReset}
        title="Reiniciar torneo"
        description="¿Reiniciar este torneo? Se borrarán los partidos y el progreso."
        confirmLabel="Reiniciar"
        isPending={resetTournament.isPending}
        error={resetTournament.error ? errorMessage(resetTournament.error) : null}
        onConfirm={handleResetTournament}
        onClose={() => {
          resetTournament.reset();
          setConfirmingReset(false);
        }}
      />
    </PageScaffold>
  );
}
