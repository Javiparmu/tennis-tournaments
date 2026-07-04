"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeroFrame } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
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
  buildEventsByDay,
  type CalendarMode,
  countMatchOutcomes,
  countTrainingSessions,
  getInitialSelectedDayKey,
  getVisibleRange,
  isDayKeyWithinRange,
  toLocalDayKey,
} from "./_components/date-utils";
import { MatchModal } from "./_components/match-modal";
import { OverviewSection } from "./_components/overview-section";
import { ProfileEditModal } from "./_components/profile-edit-modal";
import { RacketFormModal } from "./_components/racket-form-modal";
import { RacketsCard } from "./_components/rackets-card";
import { RegisteredTournamentsCarousel } from "./_components/registered-tournaments-carousel";
import { type ProfileSection, SectionNavigation } from "./_components/section-navigation";
import { StatsCard } from "./_components/stats-card";
import { StringingFormModal } from "./_components/stringing-form-modal";
import { TrainingFormModal } from "./_components/training-form-modal";
import { TrainingSection } from "./_components/training-section";
import { UserSummaryCard } from "./_components/user-summary-card";

const EMPTY_EVENTS: ProfileCalendarEvent[] = [];

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

  const trainingEvents = useMemo(
    () =>
      events
        .filter(
          (event): event is ProfileCalendarEvent & { training: UserTrainingEntry } =>
            event.eventType === "TRAINING" && event.training != null,
        )
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
  const rackets = isOwner ? (myRacketsQuery.data ?? []) : (publicRacketsQuery.data ?? []);
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
      <PageScaffold>
        <p className="text-rose-600">El perfil solicitado no es válido.</p>
      </PageScaffold>
    );
  }

  if (userQuery.isLoading) {
    return (
      <PageScaffold>
        <p className="text-zinc-600">Cargando página de usuario...</p>
      </PageScaffold>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <PageScaffold>
        <p className="text-rose-600">No se pudo cargar esta página de usuario.</p>
      </PageScaffold>
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
    <PageScaffold>
      <PageHeroFrame className="p-6 md:p-8" contentClassName="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
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
      </PageHeroFrame>

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
        <OverviewSection
          mode={mode}
          anchorDate={anchorDate}
          selectedDayKey={selectedDayKey}
          calendarDays={calendarDays}
          events={events}
          onModeChange={setMode}
          onDaySelect={setManualSelectedDayKey}
          onAnchorDateChange={setAnchorDate}
          calendarLoading={calendarLoading}
          overviewPreview={overviewPreview}
          rackets={rackets}
          racketsLoading={racketsLoading}
          isOwner={isOwner}
        />
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
    </PageScaffold>
  );
}
