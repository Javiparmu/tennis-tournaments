"use client";

import { CalendarDays, Dumbbell, LayoutDashboard, Target } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeroFrame } from "@/components/page-hero";
import { PageScaffold } from "@/components/page-scaffold";
import { PageSkeleton } from "@/components/page-skeleton";
import { type SectionTabItem, SectionTabs } from "@/components/section-tabs";
import {
  useCreateRacketMutation,
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
  CreateTrainingRequest,
  ProfileCalendarEvent,
  RacketSummary,
  UserProfileMatchEntry,
  UserTrainingEntry,
} from "@/models";
import { AchievementsCard } from "./achievements-card";
import { CalendarSection } from "./calendar-section";
import {
  buildEventsByDay,
  type CalendarMode,
  countMatchOutcomes,
  countTrainingSessions,
  getInitialSelectedDayKey,
  getVisibleRange,
  isDayKeyWithinRange,
  toLocalDayKey,
} from "./date-utils";
import { MatchModal } from "./match-modal";
import { ProfileEditModal } from "./profile-edit-modal";
import { RacketDetailModal } from "./racket-detail-modal";
import { RacketFormModal } from "./racket-form-modal";
import { RacketsCard } from "./rackets-card";
import { RatingProgressCard } from "./rating-progress-card";
import { RegisteredTournamentsCarousel } from "./registered-tournaments-carousel";
import { StatsCard } from "./stats-card";
import { TrainingFormModal } from "./training-form-modal";
import { TrainingSection } from "./training-section";
import { UserSummaryCard } from "./user-summary-card";
import { WeekStripCard } from "./week-strip-card";

const EMPTY_EVENTS: ProfileCalendarEvent[] = [];

export default function UserPage() {
  // The [id] route segment carries the unique username, not the DB id — ids are not exposed in URLs.
  const params = useParams<{ id: string | string[] }>();
  const rawUsername = Array.isArray(params.id) ? params.id[0] : params.id;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  const [mode, setMode] = useState<CalendarMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [manualSelectedDayKey, setManualSelectedDayKey] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<UserProfileMatchEntry | null>(null);
  const [editingTraining, setEditingTraining] = useState<UserTrainingEntry | null | undefined>(undefined);
  const [editingRacket, setEditingRacket] = useState<RacketSummary | null | undefined>(undefined);
  const [detailRacket, setDetailRacket] = useState<RacketSummary | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    { type: "training"; training: UserTrainingEntry } | { type: "racket"; racket: RacketSummary } | null
  >(null);

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
  const racketError = createRacketMutation.error ?? updateRacketMutation.error;
  const deleteError =
    pendingDelete?.type === "training"
      ? deleteTrainingMutation.error && errorMessage(deleteTrainingMutation.error)
      : pendingDelete?.type === "racket"
        ? deleteRacketMutation.error && errorMessage(deleteRacketMutation.error)
        : null;
  const racketSubmitError = racketError ? errorMessage(racketError) : null;

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
        <div className="space-y-6">
          <PageSkeleton rows={1} height="h-44" />
          <PageSkeleton rows={2} height="h-32" />
        </div>
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
  const currentRating = user.rating ?? 1000;

  async function handleTrainingSubmit(payload: CreateTrainingRequest) {
    try {
      if (editingTraining) {
        await updateTrainingMutation.mutateAsync({ trainingId: editingTraining.id, payload });
      } else {
        await createTrainingMutation.mutateAsync(payload);
      }
      setEditingTraining(undefined);
    } catch {
      // Error state is surfaced through the mutation objects and the modal stays open.
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

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === "training") {
        await deleteTrainingMutation.mutateAsync(pendingDelete.training.id);
      } else {
        await deleteRacketMutation.mutateAsync(pendingDelete.racket.id);
      }
      setPendingDelete(null);
    } catch {
      // Error surfaced in the ConfirmDialog via the mutation object.
    }
  }

  function closeDeleteDialog() {
    deleteTrainingMutation.reset();
    deleteRacketMutation.reset();
    setPendingDelete(null);
  }

  function closeRacketModal() {
    createRacketMutation.reset();
    updateRacketMutation.reset();
    setEditingRacket(undefined);
  }

  const dayPreview = allSelectedDayEvents.slice(0, 3);

  const resumenContent = (
    <div className="space-y-6">
      <StatsCard
        scheduledMatches={scheduledMatches}
        playedMatches={playedMatches}
        trainings={trainingCount}
        racketsCount={rackets.length}
        isOwner={isOwner}
      />
      <RatingProgressCard userId={viewedUserId} currentRating={currentRating} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RegisteredTournamentsCarousel userId={viewedUserId} />
        <AchievementsCard achievements={user.achievements ?? []} />
      </div>
      {isOwner ? <WeekStripCard calendarDays={calendarDays} events={events} loading={calendarLoading} /> : null}
      <RacketsCard
        rackets={rackets}
        isOwner={isOwner}
        isLoading={racketsLoading}
        preview
        previewLimit={4}
        seeAllHref="?tab=raquetas"
        onOpenDetail={setDetailRacket}
      />
    </div>
  );

  const tabs: SectionTabItem[] = [{ id: "resumen", label: "Resumen", icon: LayoutDashboard, content: resumenContent }];

  if (isOwner) {
    tabs.push({
      id: "calendario",
      label: "Calendario",
      icon: CalendarDays,
      content: (
        <CalendarSection
          mode={mode}
          anchorDate={anchorDate}
          selectedDayKey={selectedDayKey}
          calendarDays={calendarDays}
          events={events}
          onModeChange={setMode}
          onDaySelect={setManualSelectedDayKey}
          onAnchorDateChange={setAnchorDate}
          calendarLoading={calendarLoading}
          dayPreview={dayPreview}
        />
      ),
    });
  }

  tabs.push({
    id: "raquetas",
    label: "Raquetas",
    icon: Target,
    content: (
      <RacketsCard
        rackets={rackets}
        isOwner={isOwner}
        isLoading={racketsLoading}
        hideHeader
        onAdd={isOwner ? () => setEditingRacket(null) : undefined}
        onEdit={isOwner ? setEditingRacket : undefined}
        onDelete={isOwner ? (racket) => setPendingDelete({ type: "racket", racket }) : undefined}
        onOpenDetail={setDetailRacket}
        isMutating={deleteRacketMutation.isPending}
      />
    ),
  });

  if (isOwner) {
    tabs.push({
      id: "entrenos",
      label: "Entrenos",
      icon: Dumbbell,
      content: (
        <TrainingSection
          isOwner={isOwner}
          trainings={trainingEvents}
          onCreate={() => setEditingTraining(null)}
          onEdit={setEditingTraining}
          onDelete={(training) => setPendingDelete({ type: "training", training })}
          isDeleting={deleteTrainingMutation.isPending}
        />
      ),
    });
  }

  return (
    <PageScaffold>
      <PageHeroFrame className="p-5 md:p-6">
        <UserSummaryCard
          displayName={displayName}
          username={handle}
          imageUrl={user.imageUrl}
          createdAt={user.createdAt}
          rating={currentRating}
          isOwner={isOwner}
          onEdit={() => setIsEditingProfile(true)}
        />
      </PageHeroFrame>

      {(calendarQuery.error || publicRacketsQuery.error || myRacketsQuery.error) && !racketsLoading ? (
        <p className="mt-6 text-sm text-rose-600">Algunas secciones del perfil no se pudieron cargar por completo.</p>
      ) : null}

      <div className="mt-8">
        <SectionTabs tabs={tabs} ariaLabel="Secciones del perfil" />
      </div>

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
      {detailRacket ? (
        <RacketDetailModal
          racket={detailRacket}
          userId={viewedUserId}
          isOwner={isOwner}
          onClose={() => setDetailRacket(null)}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.type === "racket" ? "Eliminar raqueta" : "Eliminar entrenamiento"}
        description={
          pendingDelete?.type === "racket"
            ? `¿Eliminar la raqueta "${pendingDelete.racket.displayName}"?`
            : pendingDelete?.type === "training"
              ? `¿Eliminar la sesión de entrenamiento del ${pendingDelete.training.trainingDate}?`
              : undefined
        }
        confirmLabel="Eliminar"
        isPending={deleteTrainingMutation.isPending || deleteRacketMutation.isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteDialog}
      />
    </PageScaffold>
  );
}
