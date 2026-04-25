"use client";

import { Card, Chip } from "@heroui/react";
import { CalendarDays, Lock, Medal, Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  useMeQuery,
  useMyRacketsQuery,
  usePublicRacketsQuery,
  useUserMatchActivityQuery,
  useUserQuery,
} from "@/lib/queries";
import type { RacketSummary, UserMatchActivityItem } from "@/lib/types";
import { MatchModal } from "./_components/match-modal";
import { MiniCalendar } from "./_components/mini-calendar";
import {
  buildMatchesByDay,
  countWins,
  type CalendarMode,
  formatDayHeading,
  formatTime,
  getVisibleRange,
  isDayKeyWithinRange,
  toLocalDayKey,
} from "./_components/date-utils";

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

const EMPTY_MATCHES: UserMatchActivityItem[] = [];

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

        <p className="text-sm text-zinc-600">
          Public user page synced from backend profile data. Joined {formatDate(createdAt)}.
        </p>

        <div className="flex flex-wrap gap-2">
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <Chip
                key={achievement.id}
                variant="soft"
                color="success"
                title={achievement.description ?? achievement.name}
              >
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
  totalMatches,
  wins,
  racketsCount,
  isOwner,
}: {
  totalMatches: number;
  wins: number;
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
          Matches in view: <strong>{totalMatches}</strong>
        </p>
        <p className="flex items-center gap-2 text-zinc-700">
          <Trophy className="h-4 w-4 text-emerald-700" />
          Wins in view: <strong>{wins}</strong>
        </p>
        <p className="flex items-center gap-2 text-zinc-700">
          <Medal className="h-4 w-4 text-emerald-700" />
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
        {!isLoading && rackets.length === 0 ? (
          <p className="text-sm text-zinc-500">No rackets available for this view.</p>
        ) : null}
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

export default function UserPage() {
  const params = useParams<{ id: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const viewedUserId = Number(rawId);
  const isValidUserId = Number.isInteger(viewedUserId) && viewedUserId > 0;

  const [mode, setMode] = useState<CalendarMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [manualSelectedDayKey, setManualSelectedDayKey] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<UserMatchActivityItem | null>(null);

  const range = useMemo(() => getVisibleRange(mode, anchorDate), [anchorDate, mode]);

  const userQuery = useUserQuery(isValidUserId ? viewedUserId : undefined);
  const meQuery = useMeQuery();
  const isOwner = meQuery.data?.id === viewedUserId;
  const activityQuery = useUserMatchActivityQuery(
    isValidUserId ? viewedUserId : undefined,
    range.fromIso,
    range.toIso,
  );
  const publicRacketsQuery = usePublicRacketsQuery(isValidUserId && !isOwner ? viewedUserId : undefined);
  const myRacketsQuery = useMyRacketsQuery(isOwner);

  const matches = activityQuery.data?.matches ?? EMPTY_MATCHES;
  const matchesByDay = useMemo(() => buildMatchesByDay(matches), [matches]);
  const rackets = isOwner ? myRacketsQuery.data ?? [] : publicRacketsQuery.data ?? [];
  const racketsLoading = isOwner ? myRacketsQuery.isLoading : publicRacketsQuery.isLoading;
  const wins = countWins(matches);

  const selectedDayKey = useMemo(() => {
    if (
      manualSelectedDayKey &&
      isDayKeyWithinRange(manualSelectedDayKey, range.from, range.to) &&
      matchesByDay[manualSelectedDayKey]
    ) {
      return manualSelectedDayKey;
    }

    return Object.keys(matchesByDay).sort()[0] ?? toLocalDayKey(anchorDate);
  }, [anchorDate, manualSelectedDayKey, matchesByDay, range.from, range.to]);

  const selectedDayMatches = matchesByDay[selectedDayKey] ?? EMPTY_MATCHES;

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
  const displayName = activityQuery.data?.playerName ?? user.username;

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
          <StatsCard totalMatches={matches.length} wins={wins} racketsCount={rackets.length} isOwner={isOwner} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <MiniCalendar
              mode={mode}
              anchorDate={anchorDate}
              selectedDayKey={selectedDayKey}
              matchesByDay={matchesByDay}
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
              <Card.Header className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{formatDayHeading(selectedDayKey)}</p>
                  <p className="text-sm text-zinc-500">
                    {selectedDayMatches.length} match{selectedDayMatches.length === 1 ? "" : "es"} on this day.
                  </p>
                </div>
                {activityQuery.isLoading ? (
                  <Chip variant="soft" color="default">
                    Loading
                  </Chip>
                ) : null}
              </Card.Header>
              <Card.Content className="gap-3 pt-0">
                {activityQuery.error ? (
                  <p className="text-sm text-rose-600">Could not load match activity for this range.</p>
                ) : null}
                {!activityQuery.isLoading && selectedDayMatches.length === 0 ? (
                  <p className="text-sm text-zinc-500">No completed matches landed on this day.</p>
                ) : null}
                {selectedDayMatches.map((match) => (
                  <button
                    key={match.matchId}
                    type="button"
                    onClick={() => setSelectedMatch(match)}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-emerald-300 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-zinc-900">vs {match.opponent?.name ?? "Unknown opponent"}</p>
                          <Chip color={match.result === "WIN" ? "success" : "danger"} variant="soft">
                            {match.result}
                          </Chip>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          {match.tournament.name} · {match.phase.format} round {match.phase.round}
                        </p>
                      </div>
                      <div className="text-right text-sm text-zinc-500">
                        <p>{formatTime(match.completedAt)}</p>
                        <p>{match.court ?? "No court"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </Card.Content>
            </Card>
          </div>

          <div className="space-y-3">
            {(publicRacketsQuery.error || myRacketsQuery.error) && !racketsLoading ? (
              <p className="text-sm text-rose-600">Could not load rackets for this view.</p>
            ) : null}
            <RacketsCard rackets={rackets} isOwner={isOwner} isLoading={racketsLoading} />
          </div>
        </div>
      </main>

      <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}
