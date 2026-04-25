"use client";

import { Button, Card, Chip } from "@heroui/react";
import { CalendarDays, Dumbbell, Lock, Medal, Target, Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  useCreateTrainingMutation,
  useDeleteTrainingMutation,
  useMeQuery,
  useMyProfileCalendarQuery,
  useMyRacketsQuery,
  usePublicRacketsQuery,
  useUpdateTrainingMutation,
  useUserProfileCalendarQuery,
  useUserQuery,
} from "@/lib/queries";
import type {
  CreateTrainingRequest,
  ProfileCalendarEvent,
  RacketSummary,
  UserProfileMatchEntry,
  UserTrainingEntry,
} from "@/lib/types";
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
} from "./_components/date-utils";
import { MatchModal } from "./_components/match-modal";
import { MiniCalendar } from "./_components/mini-calendar";
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
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTrainingDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getTrainingDurationLabel(durationMinutes: number | null) {
  if (durationMinutes == null) return "No duration recorded";
  if (durationMinutes < 60) return `${durationMinutes} min`;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

function UserSummaryCard({
  displayName,
  username,
  createdAt,
  achievements,
  isOwner,
}: {
  displayName: string;
  username: string;
  createdAt: string | null;
  achievements: Array<{ id: number; name: string; description: string | null }>;
  isOwner: boolean;
}) {
  const initials = createInitials(displayName);

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <Card.Content className="gap-5 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-zinc-900">{displayName}</h1>
              {isOwner ? (
                <Chip color="success" variant="soft">
                  Your page
                </Chip>
              ) : null}
            </div>
            <p className="text-sm text-zinc-500">@{username}</p>
          </div>
        </div>

        <p className="text-sm text-zinc-600">Joined {formatDate(createdAt)}. Public profile data is synced from the backend.</p>

        <div className="flex flex-wrap gap-2">
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <Chip key={achievement.id} variant="soft" color="success" title={achievement.description ?? achievement.name}>
                {achievement.name}
              </Chip>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No achievements unlocked yet.</p>
          )}
        </div>
      </Card.Content>
    </Card>
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
  return (
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <Card.Header>
        <p className="text-lg font-semibold">Snapshot</p>
      </Card.Header>
      <Card.Content className="space-y-4 pt-0">
        <p className="flex items-center gap-2 text-zinc-700">
          <CalendarDays className="h-4 w-4 text-emerald-700" />
          Events in view: <strong>{totalEvents}</strong>
        </p>
        <p className="flex items-center gap-2 text-zinc-700">
          <Target className="h-4 w-4 text-sky-700" />
          Scheduled / live matches: <strong>{scheduledMatches}</strong>
        </p>
        <p className="flex items-center gap-2 text-zinc-700">
          <Trophy className="h-4 w-4 text-emerald-700" />
          Played matches: <strong>{playedMatches}</strong>
        </p>
        <p className="flex items-center gap-2 text-zinc-700">
          <Dumbbell className="h-4 w-4 text-violet-700" />
          Training sessions: <strong>{trainings}</strong>
        </p>
        <p className="flex items-center gap-2 text-zinc-700">
          <Medal className="h-4 w-4 text-amber-700" />
          {isOwner ? "Your rackets" : "Public rackets"}: <strong>{racketsCount}</strong>
        </p>
      </Card.Content>
    </Card>
  );
}

function RacketsCard({ rackets, isOwner, isLoading }: { rackets: RacketSummary[]; isOwner: boolean; isLoading: boolean }) {
  return (
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <Card.Header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{isOwner ? "Rackets" : "Public rackets"}</p>
          <p className="text-sm text-zinc-500">
            {isOwner ? "Private rackets are visible only on your own page." : "Only publicly visible rackets appear here."}
          </p>
        </div>
        {isOwner ? (
          <Chip color="default" variant="soft">
            Owner view
          </Chip>
        ) : null}
      </Card.Header>
      <Card.Content className="gap-3 pt-0">
        {isLoading ? <p className="text-sm text-zinc-500">Loading rackets...</p> : null}
        {!isLoading && rackets.length === 0 ? <p className="text-sm text-zinc-500">No rackets available for this view.</p> : null}
        {rackets.map((racket) => (
          <div key={racket.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-zinc-900">{racket.displayName}</p>
                <p className="text-sm text-zinc-500">
                  {[racket.brand, racket.model, racket.stringPattern].filter(Boolean).join(" · ") || "No racket details"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && racket.visibility === "PRIVATE" ? <Lock className="h-4 w-4 text-zinc-500" /> : null}
                <Chip color={racket.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                  {racket.visibility}
                </Chip>
              </div>
            </div>
            {racket.latestStringing ? (
              <p className="mt-3 text-sm text-zinc-600">
                Last stringing {racket.latestStringing.stringingDate} · {racket.latestStringing.mainsTensionKg}/
                {racket.latestStringing.crossesTensionKg} kg
              </p>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">No stringing history yet.</p>
            )}
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

function SectionNavigation({
  activeSection,
  onChange,
}: {
  activeSection: ProfileSection;
  onChange: (section: ProfileSection) => void;
}) {
  const sections: Array<{ key: ProfileSection; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "calendar", label: "Matches & Calendar" },
    { key: "training", label: "Training" },
    { key: "rackets", label: "Rackets" },
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {sections.map((section) => (
        <Button
          key={section.key}
          variant={activeSection === section.key ? "primary" : "ghost"}
          className={activeSection === section.key ? "bg-emerald-600 text-white" : "text-zinc-700"}
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
      {status}
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
    { key: "ALL", label: "All" },
    { key: "MATCH", label: "Matches" },
    { key: "TRAINING", label: "Trainings" },
  ];

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <Card.Header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{formatDayHeading(selectedDayKey)}</p>
          <p className="text-sm text-zinc-500">
            {allEvents.length} item{allEvents.length === 1 ? "" : "s"} scheduled for this day.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              size="sm"
              variant={agendaFilter === filter.key ? "primary" : "ghost"}
              className={agendaFilter === filter.key ? "bg-emerald-600 text-white" : "text-zinc-700"}
              onPress={() => onAgendaFilterChange(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </Card.Header>
      <Card.Content className="gap-3 pt-0">
        {filteredEvents.length === 0 ? <p className="text-sm text-zinc-500">No items match the current filter.</p> : null}
        {filteredEvents.map((event) => {
          if (event.eventType === "MATCH" && event.match) {
            const match = event.match;
            const referenceTime = getMatchDisplayTime(match);
            return (
              <button
                key={event.eventId}
                type="button"
                onClick={() => onMatchSelect(match)}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-emerald-300 hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">vs {match.opponent?.name ?? "Unknown opponent"}</p>
                      {match.result ? (
                        <Chip color={match.result === "WIN" ? "success" : "danger"} variant="soft">
                          {match.result}
                        </Chip>
                      ) : null}
                      <StatusChip status={match.status} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {match.tournament.name} · {match.phase.format} round {match.phase.round}
                    </p>
                  </div>
                  <div className="text-right text-sm text-zinc-500">
                    <p>{referenceTime ? formatTime(referenceTime) : "Time TBD"}</p>
                    <p>{match.court ?? "No court"}</p>
                  </div>
                </div>
              </button>
            );
          }

          const training = event.training;
          if (!training) return null;

          return (
            <div key={event.eventId} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-zinc-900">Training session</p>
                    <Chip color="default" variant="soft">
                      {getTrainingDurationLabel(training.durationMinutes)}
                    </Chip>
                    <Chip color={training.visibility === "PUBLIC" ? "success" : "default"} variant="soft">
                      {training.visibility}
                    </Chip>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{training.notes ?? "No notes recorded for this session."}</p>
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
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <Card.Header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">Training sessions</p>
          <p className="text-sm text-zinc-500">
            {isOwner
              ? "Log new sessions, add notes, and choose whether each one is public or private."
              : "Only training sessions shared publicly by this player appear here."}
          </p>
        </div>
        {isOwner ? (
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onPress={onCreate}>
            Add training session
          </Button>
        ) : null}
      </Card.Header>
      <Card.Content className="gap-3 pt-0">
        {deleteError ? <p className="text-sm text-rose-600">{deleteError}</p> : null}
        {trainings.length === 0 ? <p className="text-sm text-zinc-500">No training sessions recorded in this range.</p> : null}
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
                    {training.visibility}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{training.notes ?? "No notes recorded for this session."}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  Logged {formatDateTime(training.createdAt)}
                  {training.updatedAt ? ` · Updated ${formatDateTime(training.updatedAt)}` : ""}
                </p>
              </div>

              {isOwner ? (
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-zinc-700" onPress={() => onEdit(training)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-rose-600"
                    onPress={() => onDelete(training)}
                    isDisabled={isDeleting}
                  >
                    Delete
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
  const params = useParams<{ id: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const viewedUserId = Number(rawId);
  const isValidUserId = Number.isInteger(viewedUserId) && viewedUserId > 0;

  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  const [mode, setMode] = useState<CalendarMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [manualSelectedDayKey, setManualSelectedDayKey] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<UserProfileMatchEntry | null>(null);
  const [agendaFilter, setAgendaFilter] = useState<AgendaFilter>("ALL");
  const [editingTraining, setEditingTraining] = useState<UserTrainingEntry | null | undefined>(undefined);

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const range = useMemo(() => getVisibleRange(mode, anchorDate), [anchorDate, mode]);

  const userQuery = useUserQuery(isValidUserId ? viewedUserId : undefined);
  const meQuery = useMeQuery();
  const isOwner = meQuery.data?.id === viewedUserId;
  const shouldLoadPublicCalendar = isValidUserId && !isOwner;

  const myCalendarQuery = useMyProfileCalendarQuery(isOwner, range.fromDate, range.toDate, timezone);
  const publicCalendarQuery = useUserProfileCalendarQuery(
    shouldLoadPublicCalendar ? viewedUserId : undefined,
    range.fromDate,
    range.toDate,
    timezone,
  );
  const publicRacketsQuery = usePublicRacketsQuery(isValidUserId && !isOwner ? viewedUserId : undefined);
  const myRacketsQuery = useMyRacketsQuery(isOwner);
  const createTrainingMutation = useCreateTrainingMutation();
  const updateTrainingMutation = useUpdateTrainingMutation();
  const deleteTrainingMutation = useDeleteTrainingMutation();

  const calendarQuery = isOwner ? myCalendarQuery : publicCalendarQuery;
  const events = calendarQuery.data?.events ?? EMPTY_EVENTS;
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

  const trainingSubmitError = getErrorMessage(createTrainingMutation.error) ?? getErrorMessage(updateTrainingMutation.error);
  const trainingDeleteError = getErrorMessage(deleteTrainingMutation.error);

  if (!isValidUserId) {
    return (
      <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-rose-600">The requested user id is invalid.</p>
        </main>
      </div>
    );
  }

  if (userQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-zinc-600">Loading user page...</p>
        </main>
      </div>
    );
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-rose-600">Could not load this user page.</p>
        </main>
      </div>
    );
  }

  const user = userQuery.data;
  const displayName = user.username;

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
    const confirmed = window.confirm(`Delete the training session on ${training.trainingDate}?`);
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

  const overviewPreview = allSelectedDayEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <UserSummaryCard
            displayName={displayName}
            username={user.username}
            createdAt={user.createdAt}
            achievements={user.achievements}
            isOwner={isOwner}
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

        <SectionNavigation activeSection={activeSection} onChange={setActiveSection} />

        {(calendarQuery.error || publicRacketsQuery.error || myRacketsQuery.error) && !racketsLoading ? (
          <p className="mt-6 text-sm text-rose-600">Some profile sections could not be loaded completely.</p>
        ) : null}

        {activeSection === "overview" ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
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
              <Card className="border border-zinc-200 bg-white shadow-sm">
                <Card.Header>
                  <div>
                    <p className="text-lg font-semibold">At a glance</p>
                    <p className="text-sm text-zinc-500">Quick preview of the currently selected day.</p>
                  </div>
                </Card.Header>
                <Card.Content className="gap-3 pt-0">
                  {calendarLoading ? <p className="text-sm text-zinc-500">Loading calendar...</p> : null}
                  {!calendarLoading && overviewPreview.length === 0 ? (
                    <p className="text-sm text-zinc-500">Nothing is scheduled for this day yet.</p>
                  ) : null}
                  {overviewPreview.map((event) => (
                    <div key={event.eventId} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      {event.eventType === "MATCH" && event.match ? (
                        (() => {
                          const referenceTime = getMatchDisplayTime(event.match);
                          return (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-zinc-900">Match vs {event.match.opponent?.name ?? "Unknown opponent"}</p>
                                <p className="text-sm text-zinc-500">{event.match.tournament.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusChip status={event.match.status} />
                                <span className="text-sm text-zinc-500">{referenceTime ? formatTime(referenceTime) : "Time TBD"}</span>
                              </div>
                            </div>
                          );
                        })()
                      ) : event.training ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-zinc-900">Training session</p>
                            <p className="text-sm text-zinc-500">{event.training.notes ?? "No notes recorded."}</p>
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
            </div>

            <div className="space-y-6">
              <RacketsCard rackets={rackets.slice(0, 3)} isOwner={isOwner} isLoading={racketsLoading} />
              <Card className="border border-zinc-200 bg-white shadow-sm">
                <Card.Header>
                  <div>
                    <p className="text-lg font-semibold">Training visibility</p>
                    <p className="text-sm text-zinc-500">
                      {isOwner
                        ? "Each training session can be shared publicly or kept private."
                        : "Only sessions shared publicly are visible on this profile."}
                    </p>
                  </div>
                </Card.Header>
                <Card.Content className="pt-0 text-sm text-zinc-600">
                  {isOwner
                    ? "Use the training tab to record sessions, notes, and visibility for each entry."
                    : "Training notes only appear when the player marks that session as public."}
                </Card.Content>
              </Card>
            </div>
          </div>
        ) : null}

        {activeSection === "calendar" ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
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

              {calendarLoading ? <p className="text-sm text-zinc-500">Loading calendar...</p> : null}
              {calendarQuery.error ? <p className="text-sm text-rose-600">Could not load calendar activity for this range.</p> : null}

              <AgendaCard
                selectedDayKey={selectedDayKey}
                allEvents={allSelectedDayEvents}
                filteredEvents={selectedDayEvents}
                agendaFilter={agendaFilter}
                onAgendaFilterChange={setAgendaFilter}
                onMatchSelect={setSelectedMatch}
              />
            </div>

            <div className="space-y-6">
              <Card className="border border-zinc-200 bg-white shadow-sm">
                <Card.Header>
                  <div>
                    <p className="text-lg font-semibold">Range summary</p>
                    <p className="text-sm text-zinc-500">Use the calendar to switch between month and week planning.</p>
                  </div>
                </Card.Header>
                <Card.Content className="space-y-3 pt-0 text-sm text-zinc-600">
                  <p>Scheduled matches: {matchCounts.scheduled}</p>
                  <p>Live matches: {matchCounts.live}</p>
                  <p>Completed / walkover matches: {playedMatches}</p>
                  <p>Training sessions: {trainingCount}</p>
                  <p>Wins in range: {matchCounts.wins}</p>
                </Card.Content>
              </Card>
              <RacketsCard rackets={rackets} isOwner={isOwner} isLoading={racketsLoading} />
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
            <RacketsCard rackets={rackets} isOwner={isOwner} isLoading={racketsLoading} />
          </div>
        ) : null}
      </main>

      <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
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
    </div>
  );
}
