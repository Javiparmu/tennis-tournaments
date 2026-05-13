"use client";

import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";
import { ArrowRight, CalendarDays, MapPin, Sparkles, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useUpcomingCalendarQuery } from "@/data/queries";

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

export default function Home() {
  const { data: upcoming = [], isLoading } = useUpcomingCalendarQuery(4);

  return (
    <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="border border-emerald-100 bg-white shadow-sm">
            <Card.Content className="gap-6 p-8">
              <Chip variant="soft" className="w-fit border border-emerald-200 bg-emerald-50 text-emerald-700">
                Built for tennis players and clubs
              </Chip>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-zinc-900 md:text-5xl">
                Spot your next tournament in seconds.
              </h1>
              <p className="max-w-2xl text-base text-zinc-600">
                CourtRank blends tournament discovery, Elo progression, and player profiles in one
                clean workflow. Clubs publish events, players join quickly, and everything is built
                for speed and clarity.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/tournaments">
                  <Button className="bg-emerald-600 font-medium text-white hover:bg-emerald-700">
                    Explore tournaments
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="border-emerald-200 text-emerald-700">
                    Open my profile
                  </Button>
                </Link>
              </div>
              <div className="grid gap-3 border-t border-zinc-100 pt-5 text-sm text-zinc-600 sm:grid-cols-3">
                <p className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Live tournament feed
                </p>
                <p className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-emerald-600" />
                  Elo-based ranking
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  Fast weekly planning
                </p>
              </div>
            </Card.Content>
          </Card>

          <Card className="border border-zinc-200 bg-white shadow-sm">
            <Card.Header className="items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                <p className="text-lg font-semibold text-zinc-900">Calendar at a glance</p>
              </div>
              <Link href="/tournaments" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                View all
              </Link>
            </Card.Header>
            <Card.Content className="gap-4 pt-0">
              {upcoming.slice(0, 3).map((tournament) => (
                <div key={tournament.id} className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-900">{tournament.name}</p>
                    <Chip size="sm" variant="soft" color="success">
                      {tournament.surface ?? "N/A"}
                    </Chip>
                  </div>
                  <p className="text-xs text-zinc-500">{formatDateRange(tournament.startDate, tournament.endDate)}</p>
                </div>
              ))}
              {!isLoading && upcoming.length === 0 && (
                <p className="text-sm text-zinc-500">No upcoming tournaments available.</p>
              )}
            </Card.Content>
          </Card>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-900">Upcoming tournaments</h2>
            <Link href="/tournaments">
              <Button variant="ghost" className="text-zinc-700">
                See all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((tournament) => (
              <Card key={tournament.id} className="border border-zinc-200 bg-zinc-50/70">
                <Card.Content className="gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-zinc-900">{tournament.name}</p>
                      <p className="text-sm text-zinc-500">Club #{tournament.clubId}</p>
                    </div>
                    <Chip color="success" variant="soft">
                      {tournament.surface ?? "N/A"}
                    </Chip>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-600">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-emerald-700" />
                      {formatDateRange(tournament.startDate, tournament.endDate)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      {tournament.description ?? "Tournament details from backend"}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            ))}
            {!isLoading && upcoming.length === 0 && (
              <p className="text-sm text-zinc-500">No upcoming tournaments available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
