"use client";

import { Button, Card, Chip } from "@heroui/react";
import { CalendarDays, CalendarX, Dumbbell, Lock, Medal, Target, Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { CourtLinesSvg } from "@/components/landing/court-lines-svg";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  useCreateRacketMutation,
  useCreateStringingMutation,
  useCreateTrainingMutation,
  useDeleteRacketMutation,
  useDeleteTrainingMutation,
  useMeQuery,
  useMyJoinRequestsQuery,
  useMyProfileCalendarQuery,
  useMyRacketsQuery,
  usePublicRacketsQuery,
  useTournamentsQuery,
  useUpdateRacketMutation,
  useUpdateTrainingMutation,
  useUserByUsernameQuery,
  useUserProfileCalendarQuery,
} from "@/data/queries";
import { errorMessage } from "@/lib/errors";
import type {
  CreateRacketRequest,
  CreateRacketStringingRequest,
  CreateTrainingRequest,
  ProfileCalendarEvent,
  RacketSummary,
  UserProfileMatchEntry,
  UserTrainingEntry,
} from "@/models";
import {
  type AgendaFilter,
  type CalendarMode,
  buildEventsByDay,
  countMatchOutcomes,
  countTrainingSessions,
  filterAgendaEvents,
  formatDateTime,
  formatDayHeading,
  formatTime,
  getInitialSelectedDayKey,
  getMatchDisplayTime,
  getVisibleRange,
  isDayKeyWithinRange,
  toLocalDayKey,
} from "./_components/date-utils";
import { MatchModal } from "./_components/match-modal";
import { MiniCalendar } from "./_components/mini-calendar";
import { ProfileEditModal } from "./_components/profile-edit-modal";
import { RacketFormModal } from "./_components/racket-form-modal";
import { RegisteredTournamentsCarousel } from "./_components/registered-tournaments-carousel";
import { StringingFormModal } from "./_components/stringing-form-modal";
import { TrainingFormModal } from "./_components/training-form-modal";

type ProfileSection = "overview" | "calendar" | "training" | "rackets";

const EMPTY_EVENTS: ProfileCalendarEvent[] = [];

function createInitials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Desconocido";
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTrainingDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getTrainingDurationLabel(durationMinutes: number | null) {
  if (durationMinutes == null) return "Sin duración registrada";
  if (durationMinutes < 60) return `${durationMinutes} min`;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

const MATCH_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programado",
  LIVE: "En juego",
  COMPLETED: "Finalizado",
  WALKOVER: "W.O.",
};

const RESULT_LABEL: Record<string, string> = {
  WIN: "Victoria",
  LOSS: "Derrota",
};

const VISIBILITY_LABEL: Record<string, string> = {
  PUBLIC: "Pública",
  PRIVATE: "Privada",
};

const JOIN_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  WITHDRAWN: "Retirada",
  EXPIRED: "Caducada",
};

const PHASE_FORMAT_LABEL: Record<string, string> = {
  KNOCKOUT: "Eliminatoria",
  GROUP: "Grupos",
  SWISS: "Suizo",
};

function UserSummaryCard({
  displayName,
  username,
  imageUrl,
  createdAt,
  achievements,
  isOwner,
  onEdit,
}: {
  displayName: string;
  username: string;
  imageUrl: string | null;
  createdAt: string | null;
  achievements: Array<{ id: number; name: string; description: string | null }>;
  isOwner: boolean;
  onEdit?: () => void;
}) {
  const initials = createInitials(displayName);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        {imageUrl ? (
          // biome-ignore lint/performance/noImgElement: remote Clerk avatar, not a static asset
          <img
            src={imageUrl}
            alt={displayName}
            className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-2 ring-ball-bright/30"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-court to-court-hover font-display text-xl font-black text-ball-bright shadow-sm ring-2 ring-ball-bright/30">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-black tracking-tight text-white">{displayName}</h1>
            {isOwner ? (
              <span className="rounded-full bg-ball-bright/15 px-2 py-0.5 text-xs font-semibold text-ball-bright">
                Tu página
              </span>
            ) : null}
          </div>
          <p className="text-sm text-white/60">@{username}</p>
        </div>
        {isOwner && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            Editar perfil
          </button>
        ) : null}
      </div>

      <p className="text-sm text-white/60">
        Se unió el {formatDate(createdAt)}. Los datos públicos del perfil se sincronizan desde el servidor.
      </p>

      <div className="flex flex-wrap gap-2">
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <span
              key={achievement.id}
              title={achievement.description ?? achievement.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80"
            >
              <Medal className="h-3 w-3 text-ball-bright" />
              {achievement.name}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-3 py-1 text-xs font-medium text-white/60">
            <Medal className="h-3 w-3 text-white/40" />
            Aún no se han desbloqueado logros.
          </span>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  totalEvents,
  scheduledMatches,
  playedMatches,
  trainings,
  racketsCount,
  isOwner,
}: {
  totalEvents: number;
  scheduledMatches: number;
  playedMatches: number;
  trainings: number;
  racketsCount: number;
  isOwner: boolean;
}) {
  const tiles = [
    { icon: CalendarDays, value: totalEvents, label: "Eventos en vista" },
    { icon: Target, value: scheduledMatches, label: "Programados / en juego" },
    { icon: Trophy, value: playedMatches, label: "Jugados" },
    { icon: Dumbbell, value: trainings, label: "Entrenamientos" },
    { icon: Medal, value: racketsCount, label: isOwner ? "Tus raquetas" : "Raquetas públicas" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-center backdrop-blur-md"
        >
          <tile.icon className="mx-auto h-4 w-4 text-ball-bright" />
          <p className="mt-1 font-display text-2xl font-black text-white">{tile.value}</p>
          <p className="text-[11px] text-white/70">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}

function RacketsCard({
  rackets,
  isOwner,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onAddStringing,
  isMutating,
}: {
  rackets: RacketSummary[];
  isOwner: boolean;
  isLoading: boolean;
  onAdd?: () => void;
  onEdit?: (racket: RacketSummary) => void;
  onDelete?: (racket: RacketSummary) => void;
  onAddStringing?: (racket: RacketSummary) => void;
  isMutating?: boolean;
}) {
  const showActions = isOwner && Boolean(onEdit || onDelete || onAddStringing);

  return (
    <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
      <Card.Header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">{isOwner ? "Raquetas" : "Raquetas públicas"}</p>
          <p className="text-sm text-zinc-500">
            {isOwner ? "Las raquetas privadas solo se ven en tu propia página." : "Aquí solo aparecen las raquetas visibles públicamente."}
          </p>
        </div>
        {isOwner && onAdd ? (
          <Button className="bg-court text-ball-bright hover:bg-court-hover" onPress={onAdd}>
            Añadir raqueta
          </Button>
        ) : null}
      </Card.Header>
      <Card.Content className="gap-3 pt-0">
        {isLoading ? <p className="text-sm text-zinc-500">Cargando raquetas...</p> : null}
        {!isLoading && rackets.length === 0 ? (
          <EmptyState
            size="compact"
            icon={Target}
            title="Sin raquetas"
            description="No hay raquetas disponibles en esta vista."
          />
        ) : null}
        {rackets.map((racket) => (
          <div key={racket.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-zinc-900">{racket.displayName}</p>
                <p className="text-sm text-zinc-500">
                  {[racket.brand, racket.model, racket.stringPattern].filter(Boolean).join(" · ") || "Sin detalles de la raqueta"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && racket.visibility === "PRIVATE" ? <Lock className="h-4 w-4 text-zinc-500" /> : null}
                <Chip color={racket.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                  {VISIBILITY_LABEL[racket.visibility] ?? racket.visibility}
                </Chip>
              </div>
            </div>
            {racket.latestStringing ? (
              <p className="mt-3 text-sm text-zinc-600">
                Último encordado {racket.latestStringing.stringingDate} · {racket.latestStringing.mainsTensionKg}/
                {racket.latestStringing.crossesTensionKg} kg
              </p>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">Aún no hay historial de encordados.</p>
            )}
            {showActions ? (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-200 pt-3">
                {onAddStringing ? (
                  <Button size="sm" variant="ghost" className="text-court" onPress={() => onAddStringing(racket)}>
                    Añadir encordado
                  </Button>
                ) : null}
                {onEdit ? (
                  <Button size="sm" variant="ghost" className="text-zinc-700" onPress={() => onEdit(racket)}>
                    Editar
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600"
                    onPress={() => onDelete(racket)}
                    isDisabled={isMutating}
                  >
                    Eliminar
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

function SectionNavigation({
  activeSection,
  onChange,
  isOwner,
}: {
  activeSection: ProfileSection;
  onChange: (section: ProfileSection) => void;
  isOwner: boolean;
}) {
  // Training and Rackets are owner-only; other players see just the Overview.
  const sections: Array<{ key: ProfileSection; label: string }> = [
    { key: "overview", label: "Resumen" },
    ...(isOwner
      ? ([
          { key: "training", label: "Entrenamiento" },
          { key: "rackets", label: "Raquetas" },
        ] as const)
      : []),
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {sections.map((section) => (
        <Button
          key={section.key}
          variant={activeSection === section.key ? "primary" : "ghost"}
          className={activeSection === section.key ? "bg-court text-ball-bright" : "text-zinc-700"}
          onPress={() => onChange(section.key)}
        >
          {section.label}
        </Button>
      ))}
    </div>
  );
}

function StatusChip({ status }: { status: UserProfileMatchEntry["status"] }) {
  const color = status === "LIVE" || status === "WALKOVER" ? "warning" : "default";

  return (
    <Chip color={color} variant="soft">
      {MATCH_STATUS_LABEL[status] ?? status}
    </Chip>
  );
}

function AgendaCard({
  selectedDayKey,
  allEvents,
  filteredEvents,
  agendaFilter,
  onAgendaFilterChange,
  onMatchSelect,
}: {
  selectedDayKey: string;
  allEvents: ProfileCalendarEvent[];
  filteredEvents: ProfileCalendarEvent[];
  agendaFilter: AgendaFilter;
  onAgendaFilterChange: (filter: AgendaFilter) => void;
  onMatchSelect: (match: UserProfileMatchEntry) => void;
}) {
  const filters: Array<{ key: AgendaFilter; label: string }> = [
    { key: "ALL", label: "Todo" },
    { key: "MATCH", label: "Partidos" },
    { key: "TRAINING", label: "Entrenamientos" },
    { key: "TOURNAMENT", label: "Torneos" },
  ];

  return (
    <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
      <Card.Header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">{formatDayHeading(selectedDayKey)}</p>
          <p className="text-sm text-zinc-500">
            {allEvents.length} {allEvents.length === 1 ? "evento programado" : "eventos programados"} para este día.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              size="sm"
              variant={agendaFilter === filter.key ? "primary" : "ghost"}
              className={agendaFilter === filter.key ? "bg-court text-ball-bright" : "text-zinc-700"}
              onPress={() => onAgendaFilterChange(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </Card.Header>
      <Card.Content className="gap-3 pt-0">
        {filteredEvents.length === 0 ? (
          <EmptyState
            size="compact"
            icon={CalendarX}
            title="Nada por aquí"
            description="Ningún evento coincide con el filtro actual."
          />
        ) : null}
        {filteredEvents.map((event) => {
          if (event.eventType === "MATCH" && event.match) {
            const match = event.match;
            const referenceTime = getMatchDisplayTime(match);
            return (
              <button
                key={event.eventId}
                type="button"
                onClick={() => onMatchSelect(match)}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-court/40 hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">vs {match.opponent?.name ?? "Rival desconocido"}</p>
                      {match.result ? (
                        <Chip color={match.result === "WIN" ? "success" : "danger"} variant="soft">
                          {RESULT_LABEL[match.result] ?? match.result}
                        </Chip>
                      ) : null}
                      <StatusChip status={match.status} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {match.tournament.name} · {PHASE_FORMAT_LABEL[match.phase.format] ?? match.phase.format} ronda {match.phase.round}
                    </p>
                  </div>
                  <div className="text-right text-sm text-zinc-500">
                    <p>{referenceTime ? formatTime(referenceTime) : "Hora por definir"}</p>
                    <p>{match.court ?? "Sin pista"}</p>
                  </div>
                </div>
              </button>
            );
          }

          if (event.eventType === "TOURNAMENT" && event.tournament) {
            const tournament = event.tournament;
            return (
              <div key={event.eventId} className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-900">{tournament.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">Torneo · empieza hoy</p>
                  </div>
                  <Chip color={tournament.status === "ACCEPTED" ? "success" : "warning"} variant="soft">
                    {JOIN_STATUS_LABEL[tournament.status] ?? tournament.status}
                  </Chip>
                </div>
              </div>
            );
          }

          const training = event.training;
          if (!training) return null;

          return (
            <div key={event.eventId} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-zinc-900">Sesión de entrenamiento</p>
                    <Chip color="default" variant="soft">
                      {getTrainingDurationLabel(training.durationMinutes)}
                    </Chip>
                    <Chip color={training.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                      {VISIBILITY_LABEL[training.visibility] ?? training.visibility}
                    </Chip>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{training.notes ?? "No hay notas para esta sesión."}</p>
                </div>
              </div>
            </div>
          );
        })}
      </Card.Content>
    </Card>
  );
}

function TrainingSection({
  isOwner,
  trainings,
  onCreate,
  onEdit,
  onDelete,
  isDeleting,
  deleteError,
}: {
  isOwner: boolean;
  trainings: UserTrainingEntry[];
  onCreate: () => void;
  onEdit: (training: UserTrainingEntry) => void;
  onDelete: (training: UserTrainingEntry) => void;
  isDeleting: boolean;
  deleteError: string | null;
}) {
  return (
    <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
      <Card.Header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">Sesiones de entrenamiento</p>
          <p className="text-sm text-zinc-500">
            {isOwner
              ? "Registra nuevas sesiones, añade notas y elige si cada una es pública o privada."
              : "Aquí solo aparecen las sesiones de entrenamiento que este jugador comparte públicamente."}
          </p>
        </div>
        {isOwner ? (
          <Button className="bg-court text-ball-bright hover:bg-court-hover" onPress={onCreate}>
            Añadir sesión de entrenamiento
          </Button>
        ) : null}
      </Card.Header>
      <Card.Content className="gap-3 pt-0">
        {deleteError ? <p className="text-sm text-rose-600">{deleteError}</p> : null}
        {trainings.length === 0 ? (
          <EmptyState
            size="compact"
            icon={Dumbbell}
            title="Sin entrenamientos"
            description="No hay sesiones de entrenamiento registradas en este rango."
          />
        ) : null}
        {trainings.map((training) => (
          <div key={training.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-zinc-900">{formatTrainingDate(training.trainingDate)}</p>
                  <Chip color="default" variant="soft">
                    {getTrainingDurationLabel(training.durationMinutes)}
                  </Chip>
                  <Chip color={training.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                    {VISIBILITY_LABEL[training.visibility] ?? training.visibility}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{training.notes ?? "No hay notas para esta sesión."}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  Registrado {formatDateTime(training.createdAt)}
                  {training.updatedAt ? ` · Actualizado ${formatDateTime(training.updatedAt)}` : ""}
                </p>
              </div>

              {isOwner ? (
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-zinc-700" onPress={() => onEdit(training)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-rose-600"
                    onPress={() => onDelete(training)}
                    isDisabled={isDeleting}
                  >
                    Eliminar
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

export default function UserPage() {
  // The [id] route segment carries the unique username, not the DB id — ids are not exposed in URLs.
  const params = useParams<{ id: string | string[] }>();
  const rawUsername = Array.isArray(params.id) ? params.id[0] : params.id;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  const [mode, setMode] = useState<CalendarMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [manualSelectedDayKey, setManualSelectedDayKey] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<UserProfileMatchEntry | null>(null);
  const [agendaFilter, setAgendaFilter] = useState<AgendaFilter>("ALL");
  const [editingTraining, setEditingTraining] = useState<UserTrainingEntry | null | undefined>(undefined);
  const [editingRacket, setEditingRacket] = useState<RacketSummary | null | undefined>(undefined);
  const [stringingRacket, setStringingRacket] = useState<RacketSummary | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const range = useMemo(() => getVisibleRange(mode, anchorDate), [anchorDate, mode]);

  const userQuery = useUserByUsernameQuery(username || undefined);
  const meQuery = useMeQuery();
  const viewedUserId = userQuery.data?.id;
  const isOwner = viewedUserId != null && meQuery.data?.id === viewedUserId;
  const shouldLoadPublicCalendar = viewedUserId != null && !isOwner;

  const myCalendarQuery = useMyProfileCalendarQuery(isOwner, range.fromDate, range.toDate, timezone);
  const publicCalendarQuery = useUserProfileCalendarQuery(
    shouldLoadPublicCalendar ? viewedUserId : undefined,
    range.fromDate,
    range.toDate,
    timezone,
  );
  const publicRacketsQuery = usePublicRacketsQuery(viewedUserId != null && !isOwner ? viewedUserId : undefined);
  const myRacketsQuery = useMyRacketsQuery(isOwner);
  const createTrainingMutation = useCreateTrainingMutation();
  const updateTrainingMutation = useUpdateTrainingMutation();
  const deleteTrainingMutation = useDeleteTrainingMutation();
  const createRacketMutation = useCreateRacketMutation();
  const updateRacketMutation = useUpdateRacketMutation();
  const deleteRacketMutation = useDeleteRacketMutation();
  const createStringingMutation = useCreateStringingMutation();
  const joinRequestsQuery = useMyJoinRequestsQuery();
  const tournamentsQuery = useTournamentsQuery();

  const calendarQuery = isOwner ? myCalendarQuery : publicCalendarQuery;
  const baseEvents = calendarQuery.data?.events ?? EMPTY_EVENTS;

  // Registrations (join requests) are a separate pipeline from the calendar feed.
  // Project active ones (PENDING/ACCEPTED) onto their tournament's start date so the
  // user's next tournament shows up. Owner-only: we only have the current user's requests.
  const tournamentEvents = useMemo<ProfileCalendarEvent[]>(() => {
    if (!isOwner) return EMPTY_EVENTS;
    const requests = joinRequestsQuery.data ?? [];
    const tournamentsById = new Map((tournamentsQuery.data ?? []).map((tournament) => [tournament.id, tournament]));

    return requests.flatMap((request) => {
      if (request.status !== "PENDING" && request.status !== "ACCEPTED") return [];
      const tournament = tournamentsById.get(request.tournamentId);
      if (!tournament?.startDate) return [];
      const dayKey = toLocalDayKey(new Date(tournament.startDate));
      if (!isDayKeyWithinRange(dayKey, range.from, range.to)) return [];

      return [
        {
          eventId: `tournament-${request.id}`,
          eventType: "TOURNAMENT" as const,
          date: dayKey,
          sortTime: null,
          match: null,
          training: null,
          tournament: {
            id: tournament.id,
            name: tournament.name,
            status: request.status,
            tournamentStatus: tournament.status,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            surface: tournament.surface,
          },
        },
      ];
    });
  }, [isOwner, joinRequestsQuery.data, tournamentsQuery.data, range.from, range.to]);

  const events = useMemo(
    () => (tournamentEvents.length ? [...baseEvents, ...tournamentEvents] : baseEvents),
    [baseEvents, tournamentEvents],
  );
  const calendarDays = calendarQuery.data?.calendarDays ?? [];
  const eventsByDay = useMemo(() => buildEventsByDay(events), [events]);
  const selectedDayKey = useMemo(
    () => getInitialSelectedDayKey(anchorDate, range.from, range.to, manualSelectedDayKey, eventsByDay),
    [anchorDate, eventsByDay, manualSelectedDayKey, range.from, range.to],
  );
  const allSelectedDayEvents = eventsByDay[selectedDayKey] ?? EMPTY_EVENTS;
  const selectedDayEvents = useMemo(
    () => filterAgendaEvents(allSelectedDayEvents, agendaFilter),
    [agendaFilter, allSelectedDayEvents],
  );

  const trainingEvents = useMemo(
    () =>
      events
        .filter((event): event is ProfileCalendarEvent & { training: UserTrainingEntry } => event.eventType === "TRAINING" && event.training != null)
        .map((event) => event.training)
        .sort((left, right) => {
          if (left.trainingDate !== right.trainingDate) return right.trainingDate.localeCompare(left.trainingDate);
          return right.createdAt.localeCompare(left.createdAt);
        }),
    [events],
  );

  const matchCounts = countMatchOutcomes(events);
  const playedMatches = matchCounts.completed + matchCounts.walkover;
  const scheduledMatches = matchCounts.scheduled + matchCounts.live;
  const trainingCount = countTrainingSessions(events);
  const rackets = isOwner ? myRacketsQuery.data ?? [] : publicRacketsQuery.data ?? [];
  const racketsLoading = isOwner ? myRacketsQuery.isLoading : publicRacketsQuery.isLoading;
  const calendarLoading = calendarQuery.isLoading;

  const trainingError = createTrainingMutation.error ?? updateTrainingMutation.error;
  const trainingSubmitError = trainingError ? errorMessage(trainingError) : null;
  const trainingDeleteError = deleteTrainingMutation.error ? errorMessage(deleteTrainingMutation.error) : null;
  const racketError = createRacketMutation.error ?? updateRacketMutation.error;
  const racketSubmitError = racketError ? errorMessage(racketError) : null;
  const stringingSubmitError = createStringingMutation.error ? errorMessage(createStringingMutation.error) : null;

  if (!username) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-court-ink">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <p className="text-rose-600">El perfil solicitado no es válido.</p>
        </main>
      </div>
    );
  }

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-court-ink">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <p className="text-zinc-600">Cargando página de usuario...</p>
        </main>
      </div>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-court-ink">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <p className="text-rose-600">No se pudo cargar esta página de usuario.</p>
        </main>
      </div>
    );
  }

  const user = userQuery.data;
  const displayName = user.name ?? user.username;
  const handle = user.username;

  async function handleTrainingSubmit(payload: CreateTrainingRequest) {
    try {
      if (editingTraining) {
        await updateTrainingMutation.mutateAsync({
          trainingId: editingTraining.id,
          payload,
        });
      } else {
        await createTrainingMutation.mutateAsync(payload);
      }

      setEditingTraining(undefined);
    } catch {
      // Error state is surfaced through the mutation objects and the modal stays open.
    }
  }

  async function handleTrainingDelete(training: UserTrainingEntry) {
    const confirmed = window.confirm(`¿Eliminar la sesión de entrenamiento del ${training.trainingDate}?`);
    if (!confirmed) return;

    try {
      await deleteTrainingMutation.mutateAsync(training.id);
    } catch {
      // Error state is surfaced through the mutation object.
    }
  }

  function closeTrainingModal() {
    createTrainingMutation.reset();
    updateTrainingMutation.reset();
    setEditingTraining(undefined);
  }

  async function handleRacketSubmit(payload: CreateRacketRequest) {
    try {
      if (editingRacket) {
        await updateRacketMutation.mutateAsync({ racketId: editingRacket.id, payload });
      } else {
        await createRacketMutation.mutateAsync(payload);
      }
      setEditingRacket(undefined);
    } catch {
      // Error surfaced via the mutation objects; modal stays open.
    }
  }

  async function handleRacketDelete(racket: RacketSummary) {
    if (!window.confirm(`¿Eliminar la raqueta "${racket.displayName}"?`)) return;
    try {
      await deleteRacketMutation.mutateAsync(racket.id);
    } catch {
      // Error surfaced via the mutation object.
    }
  }

  async function handleStringingSubmit(payload: CreateRacketStringingRequest) {
    if (!stringingRacket) return;
    try {
      await createStringingMutation.mutateAsync({ racketId: stringingRacket.id, payload });
      setStringingRacket(null);
    } catch {
      // Error surfaced via the mutation object; modal stays open.
    }
  }

  function closeRacketModal() {
    createRacketMutation.reset();
    updateRacketMutation.reset();
    setEditingRacket(undefined);
  }

  function closeStringingModal() {
    createStringingMutation.reset();
    setStringingRacket(null);
  }

  const overviewPreview = allSelectedDayEvents.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-court-night to-court-night-deep p-6 text-white shadow-lg md:p-8">
          <CourtLinesSvg className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.05]" />
          <div aria-hidden className="floodlight pointer-events-none absolute -top-16 right-1/4 h-72 w-72" />
          <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <UserSummaryCard
              displayName={displayName}
              username={handle}
              imageUrl={user.imageUrl}
              createdAt={user.createdAt}
              achievements={user.achievements ?? []}
              isOwner={isOwner}
              onEdit={() => setIsEditingProfile(true)}
            />
            <StatsCard
              totalEvents={events.length}
              scheduledMatches={scheduledMatches}
              playedMatches={playedMatches}
              trainings={trainingCount}
              racketsCount={rackets.length}
              isOwner={isOwner}
            />
          </div>
        </div>

        <SectionNavigation activeSection={activeSection} onChange={setActiveSection} isOwner={isOwner} />

        {(calendarQuery.error || publicRacketsQuery.error || myRacketsQuery.error) && !racketsLoading ? (
          <p className="mt-6 text-sm text-rose-600">Algunas secciones del perfil no se pudieron cargar por completo.</p>
        ) : null}

        {activeSection === "overview" && !isOwner ? (
          <div className="mt-8">
            <RegisteredTournamentsCarousel userId={viewedUserId} />
          </div>
        ) : null}

        {activeSection === "overview" && isOwner ? (
          <div className="mt-8 space-y-6">
            <MiniCalendar
              mode={mode}
              anchorDate={anchorDate}
              selectedDayKey={selectedDayKey}
              calendarDays={calendarDays}
              events={events}
              onModeChange={(nextMode) => {
                startTransition(() => {
                  setMode(nextMode);
                });
              }}
              onDaySelect={setManualSelectedDayKey}
              onAnchorDateChange={(date) => {
                startTransition(() => {
                  setAnchorDate(date);
                });
              }}
            />
            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
                <Card.Header>
                  <div>
                    <p className="font-display text-lg font-bold">De un vistazo</p>
                    <p className="text-sm text-zinc-500">Vista rápida del día seleccionado.</p>
                  </div>
                </Card.Header>
                <Card.Content className="gap-3 pt-0">
                  {calendarLoading ? <p className="text-sm text-zinc-500">Cargando calendario...</p> : null}
                  {!calendarLoading && overviewPreview.length === 0 ? (
                    <EmptyState
                      size="compact"
                      icon={CalendarX}
                      title="Día libre"
                      description="Aún no hay nada programado para este día."
                    />
                  ) : null}
                  {overviewPreview.map((event) => (
                    <div key={event.eventId} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      {event.eventType === "MATCH" && event.match ? (
                        (() => {
                          const referenceTime = getMatchDisplayTime(event.match);
                          return (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-zinc-900">Partido vs {event.match.opponent?.name ?? "Rival desconocido"}</p>
                                <p className="text-sm text-zinc-500">{event.match.tournament.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusChip status={event.match.status} />
                                <span className="text-sm text-zinc-500">{referenceTime ? formatTime(referenceTime) : "Hora por definir"}</span>
                              </div>
                            </div>
                          );
                        })()
                      ) : event.eventType === "TOURNAMENT" && event.tournament ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-zinc-900">{event.tournament.name}</p>
                            <p className="text-sm text-zinc-500">El torneo empieza hoy</p>
                          </div>
                          <Chip color={event.tournament.status === "ACCEPTED" ? "success" : "warning"} variant="soft">
                            {JOIN_STATUS_LABEL[event.tournament.status] ?? event.tournament.status}
                          </Chip>
                        </div>
                      ) : event.training ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-zinc-900">Sesión de entrenamiento</p>
                            <p className="text-sm text-zinc-500">{event.training.notes ?? "Sin notas."}</p>
                          </div>
                          <Chip color="default" variant="soft">
                            {getTrainingDurationLabel(event.training.durationMinutes)}
                          </Chip>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </Card.Content>
              </Card>

              <div className="space-y-6">
                <RacketsCard rackets={rackets.slice(0, 3)} isOwner={isOwner} isLoading={racketsLoading} />
              <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
                <Card.Header>
                  <div>
                    <p className="font-display text-lg font-bold">Visibilidad del entrenamiento</p>
                    <p className="text-sm text-zinc-500">
                      {isOwner
                        ? "Cada sesión de entrenamiento se puede compartir públicamente o mantener privada."
                        : "En este perfil solo se ven las sesiones compartidas públicamente."}
                    </p>
                  </div>
                </Card.Header>
                <Card.Content className="pt-0 text-sm text-zinc-600">
                  {isOwner
                    ? "Usa la pestaña de entrenamiento para registrar sesiones, notas y la visibilidad de cada entrada."
                    : "Las notas de entrenamiento solo aparecen cuando el jugador marca esa sesión como pública."}
                </Card.Content>
              </Card>
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "calendar" ? (
          <div className="mt-8 space-y-6">
            <MiniCalendar
              mode={mode}
              anchorDate={anchorDate}
              selectedDayKey={selectedDayKey}
              calendarDays={calendarDays}
              events={events}
              onModeChange={(nextMode) => {
                startTransition(() => {
                  setMode(nextMode);
                });
              }}
              onDaySelect={setManualSelectedDayKey}
              onAnchorDateChange={(date) => {
                startTransition(() => {
                  setAnchorDate(date);
                });
              }}
            />

            {calendarLoading ? <p className="text-sm text-zinc-500">Cargando calendario...</p> : null}
            {calendarQuery.error ? <p className="text-sm text-rose-600">No se pudo cargar la actividad del calendario para este rango.</p> : null}

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <AgendaCard
                selectedDayKey={selectedDayKey}
                allEvents={allSelectedDayEvents}
                filteredEvents={selectedDayEvents}
                agendaFilter={agendaFilter}
                onAgendaFilterChange={setAgendaFilter}
                onMatchSelect={setSelectedMatch}
              />

              <div className="space-y-6">
                <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
                  <Card.Header>
                    <div>
                      <p className="font-display text-lg font-bold">Resumen del rango</p>
                      <p className="text-sm text-zinc-500">Usa el calendario para alternar entre planificación mensual y semanal.</p>
                    </div>
                  </Card.Header>
                  <Card.Content className="space-y-3 pt-0 text-sm text-zinc-600">
                    <p>Partidos programados: {matchCounts.scheduled}</p>
                    <p>Partidos en juego: {matchCounts.live}</p>
                    <p>Partidos finalizados / W.O.: {playedMatches}</p>
                    <p>Sesiones de entrenamiento: {trainingCount}</p>
                    <p>Victorias en el rango: {matchCounts.wins}</p>
                  </Card.Content>
                </Card>
                <RacketsCard rackets={rackets} isOwner={isOwner} isLoading={racketsLoading} />
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "training" ? (
          <div className="mt-8">
            <TrainingSection
              isOwner={isOwner}
              trainings={trainingEvents}
              onCreate={() => setEditingTraining(null)}
              onEdit={setEditingTraining}
              onDelete={handleTrainingDelete}
              isDeleting={deleteTrainingMutation.isPending}
              deleteError={trainingDeleteError}
            />
          </div>
        ) : null}

        {activeSection === "rackets" ? (
          <div className="mt-8">
            <RacketsCard
              rackets={rackets}
              isOwner={isOwner}
              isLoading={racketsLoading}
              onAdd={isOwner ? () => setEditingRacket(null) : undefined}
              onEdit={isOwner ? setEditingRacket : undefined}
              onDelete={isOwner ? handleRacketDelete : undefined}
              onAddStringing={isOwner ? setStringingRacket : undefined}
              isMutating={deleteRacketMutation.isPending}
            />
          </div>
        ) : null}
      </main>
      <SiteFooter />

      <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      {isEditingProfile && isOwner ? (
        <ProfileEditModal
          initialName={user.name ?? ""}
          initialUsername={user.username}
          initialImageUrl={user.imageUrl}
          onClose={() => setIsEditingProfile(false)}
        />
      ) : null}
      {editingTraining !== undefined ? (
        <TrainingFormModal
          key={editingTraining?.id ?? "create-training"}
          training={editingTraining}
          onClose={closeTrainingModal}
          onSubmit={handleTrainingSubmit}
          isSubmitting={createTrainingMutation.isPending || updateTrainingMutation.isPending}
          submitError={trainingSubmitError}
        />
      ) : null}
      {editingRacket !== undefined ? (
        <RacketFormModal
          key={editingRacket?.id ?? "create-racket"}
          racket={editingRacket}
          onClose={closeRacketModal}
          onSubmit={handleRacketSubmit}
          isSubmitting={createRacketMutation.isPending || updateRacketMutation.isPending}
          submitError={racketSubmitError}
        />
      ) : null}
      {stringingRacket ? (
        <StringingFormModal
          racketName={stringingRacket.displayName}
          onClose={closeStringingModal}
          onSubmit={handleStringingSubmit}
          isSubmitting={createStringingMutation.isPending}
          submitError={stringingSubmitError}
        />
      ) : null}
    </div>
  );
}
