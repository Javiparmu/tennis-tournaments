"use client";

import { errorMessage } from "@courtrank/core/lib/errors";
import { formatDateRange } from "@courtrank/core/lib/format";
import { PHASE_FORMAT_LABEL, TOURNAMENT_STATUS_LABEL } from "@courtrank/core/lib/labels";
import { getMatchResultEditState } from "@courtrank/core/lib/match-results";
import { computeStandings, type PlayerStatus } from "@courtrank/core/lib/standings";
import type {
  AddPlayersRequest,
  CreatePhaseRequest,
  Match,
  PhaseConfiguration,
  UpdateMatchScoreRequest,
} from "@courtrank/core/models";
import { Button, Chip } from "@heroui/react";
import {
  Building2,
  CalendarDays,
  CircleAlert,
  Gauge,
  KeyRound,
  Layers,
  Pencil,
  Play,
  RotateCcw,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
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
  useCanManageTournament,
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
import { surfaceStyle } from "@/lib/surface";

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
  const canManage = useCanManageTournament(tournament);
  const clubNames = useClubNameMap();
  const allBracketMatches = useMemo(
    () => bracketQuery.data?.phases.flatMap((phase) => phase.rounds.flatMap((round) => round.matches)) ?? [],
    [bracketQuery.data],
  );
  const canEditSetup = tournament?.status === "DRAFT";
  const canResetTournament = tournament?.status === "STARTED" || tournament?.status === "COMPLETED";

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
    tournament && inProgress ? computeStandings(players, allBracketMatches, tournament.championPlayerId) : [];

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
    if (!canEditSetup) return;
    try {
      await updateTournament.mutateAsync({ id, ...values });
      setEditing(false);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleAddPlayers(payload: AddPlayersRequest) {
    if (!canEditSetup) return;
    try {
      await addPlayers.mutateAsync({ id, payload });
      setAddingPlayers(false);
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleCreatePhase(payload: CreatePhaseRequest) {
    if (!canEditSetup) return;
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

  function matchSelectionState(match: Match) {
    const editState = getMatchResultEditState(match, allBracketMatches);
    if (editState.canEdit) return { disabled: false };
    return {
      disabled: true,
      reason:
        editState.reason === "missing-player"
          ? "Este partido aún no tiene los dos jugadores definidos."
          : "No se puede cambiar: el siguiente partido ya tiene resultado.",
    };
  }

  return (
    <PageScaffold mainClassName="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
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
          <PageHeroFrame className="p-6 md:p-10">
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
                {tournament.clubId == null ? (
                  <>
                    <Shield className="h-4 w-4 text-white/50" />
                    Torneo privado
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 text-white/50" />
                    {clubNames.get(tournament.clubId) ?? "Club anfitrión"}
                  </>
                )}
              </span>
              {tournament.visibility === "PRIVATE" && tournament.inviteCode ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(tournament.inviteCode ?? "")}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white/80 hover:bg-white/15"
                >
                  <KeyRound className="h-4 w-4 text-white/50" />
                  {tournament.inviteCode}
                </button>
              ) : null}
            </div>

            {canManage ? (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {canEditSetup ? (
                  <>
                    <Button className="bg-ball-bright text-court-ink hover:bg-ball" onPress={() => setEditing(true)}>
                      <Pencil className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/10"
                      onPress={() => startTournament.mutate(id)}
                      isDisabled={startTournament.isPending}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Empezar
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                      onPress={() => setAddingPlayers(true)}
                    >
                      <Users className="mr-1 h-4 w-4" />
                      Añadir jugadores
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                      onPress={() => setAddingPhase(true)}
                    >
                      <Gauge className="mr-1 h-4 w-4" />
                      Añadir fase
                    </Button>
                  </>
                ) : canResetTournament ? (
                  <Button
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-white/10"
                    onPress={() => setConfirmingReset(true)}
                    isDisabled={resetTournament.isPending}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reiniciar
                  </Button>
                ) : null}
              </div>
            ) : null}
            {startTournament.error && (
              <p className="mt-2 text-sm text-rose-300">{errorMessage(startTournament.error, "tournament.start")}</p>
            )}
          </PageHeroFrame>

          <div className="mt-8 grid min-w-0 gap-8">
            <aside className="order-2 grid min-w-0 gap-6">
              <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
                <section className="min-w-0 rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
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
                      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {standings.map(({ player, wins, losses, status }) => (
                          <li key={player.id} className="rounded-xl border border-court/10 bg-court/5 p-3 text-sm">
                            <span className="flex items-start gap-2">
                              {status === "champion" && <Trophy className="h-4 w-4 shrink-0 text-court" />}
                              {player.user ? (
                                <Link
                                  href={`/players/${encodeURIComponent(player.user.username)}`}
                                  className="break-words font-medium text-court-ink hover:text-court"
                                >
                                  {player.name}
                                </Link>
                              ) : (
                                <span className="break-words font-medium text-court-ink">{player.name}</span>
                              )}
                            </span>
                            <span className="mt-2 flex flex-wrap items-center gap-2">
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
                    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {players.map((player) => (
                        <li
                          key={player.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-court/10 bg-court/5 p-3 text-sm"
                        >
                          <span className="min-w-0">
                            {player.user ? (
                              <Link
                                href={`/players/${encodeURIComponent(player.user.username)}`}
                                className="break-words font-medium text-court-ink hover:text-court"
                              >
                                {player.name}
                              </Link>
                            ) : (
                              <span className="break-words font-medium text-court-ink">{player.name}</span>
                            )}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
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

                <section className="min-w-0 rounded-2xl border border-court/10 bg-white p-5 shadow-sm">
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
              </div>
              {tournament.status === "DRAFT" && tournament.visibility === "PUBLIC" ? (
                <section>
                  {canManage ? (
                    <ManageJoinRequests tournamentId={id} />
                  ) : (
                    <JoinTournament tournamentId={id} tournamentStatus={tournament.status} />
                  )}
                </section>
              ) : null}
            </aside>

            <section className="order-1 min-w-0">
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
              {bracketQuery.data && (
                <Bracket
                  bracket={bracketQuery.data}
                  onSelectMatch={canManage ? setScoringMatch : undefined}
                  getMatchSelectionState={canManage ? matchSelectionState : undefined}
                />
              )}
              {updateScore.error && (
                <p className="mt-2 text-sm text-rose-600">{errorMessage(updateScore.error, "match.score")}</p>
              )}
            </section>
          </div>
        </>
      )}

      {editing && tournament && canEditSetup ? (
        <TournamentFormModal
          tournament={tournament}
          onClose={() => {
            updateTournament.reset();
            setEditing(false);
          }}
          onSubmit={handleEdit}
          isSubmitting={updateTournament.isPending}
          submitError={updateTournament.error ? errorMessage(updateTournament.error, "tournament.update") : null}
        />
      ) : null}
      {addingPlayers && canEditSetup ? (
        <AddPlayersModal
          onClose={() => {
            addPlayers.reset();
            setAddingPlayers(false);
          }}
          onSubmit={handleAddPlayers}
          isSubmitting={addPlayers.isPending}
          submitError={addPlayers.error ? errorMessage(addPlayers.error, "tournament.addPlayers") : null}
        />
      ) : null}
      {addingPhase && tournament && canEditSetup ? (
        <PhaseFormModal
          defaultOrder={phases.length + 1}
          onClose={() => {
            createPhase.reset();
            setAddingPhase(false);
          }}
          onSubmit={handleCreatePhase}
          isSubmitting={createPhase.isPending}
          submitError={createPhase.error ? errorMessage(createPhase.error, "phase.create") : null}
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
          submitError={updateScore.error ? errorMessage(updateScore.error, "match.score") : null}
        />
      ) : null}

      <ConfirmDialog
        open={confirmingReset}
        title="Reiniciar torneo"
        description="¿Reiniciar este torneo? Se borrarán los partidos y el progreso."
        confirmLabel="Reiniciar"
        isPending={resetTournament.isPending}
        error={resetTournament.error ? errorMessage(resetTournament.error, "tournament.reset") : null}
        onConfirm={handleResetTournament}
        onClose={() => {
          resetTournament.reset();
          setConfirmingReset(false);
        }}
      />
    </PageScaffold>
  );
}
