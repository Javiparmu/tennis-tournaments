"use client";

import { Card, Chip } from "@heroui/react";
import { CalendarDays, Gauge, MapPin, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useTournamentsQuery } from "@/data/queries";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TournamentsPage() {
  const { data: tournaments = [], isLoading } = useTournamentsQuery();

  return (
    <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Upcoming tournaments</h1>
          <p className="mt-2 text-zinc-600">
            Events published by clubs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="border border-zinc-200 bg-white shadow-sm">
              <Card.Content className="gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{tournament.name}</h2>
                    <p className="text-sm text-zinc-500">Club #{tournament.clubId}</p>
                  </div>
                  <Chip color="success" variant="soft">
                    {tournament.surface ?? "N/A"}
                  </Chip>
                </div>

                <div className="grid gap-2 text-sm text-zinc-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    {tournament.description ?? "No description"}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-700" />
                    {tournament.players.length} players
                  </p>
                  <p className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-emerald-700" />
                    {tournament.phases.length} phases
                  </p>
                </div>
              </Card.Content>
            </Card>
          ))}
          {!isLoading && tournaments.length === 0 && (
            <p className="text-sm text-zinc-500">No tournaments received from backend.</p>
          )}
        </div>
      </main>
    </div>
  );
}
