"use client";

import { CountUp } from "@/components/react-bits/CountUp";
import { useClubsQuery, usePlayersQuery, useTournamentsQuery } from "@/data/queries";
import { CourtLinesSvg } from "./court-lines-svg";

// Only show the stat band once the numbers are worth boasting about — small
// counts read worse than no band at all.
const MIN_TOURNAMENTS = 50;
const MIN_PLAYERS = 150;
const MIN_CLUBS = 10;

export function StatBand() {
  const tournaments = useTournamentsQuery();
  const players = usePlayersQuery();
  const clubs = useClubsQuery();

  // Hide while any query is still loading so the band never flashes in then out.
  if (!tournaments.data || !players.data || !clubs.data) return null;
  if (
    tournaments.data.length < MIN_TOURNAMENTS ||
    players.data.length < MIN_PLAYERS ||
    clubs.data.length < MIN_CLUBS
  ) {
    return null;
  }

  const stats = [
    { value: tournaments.data.length, label: "Torneos publicados" },
    { value: players.data.length, label: "Jugadores registrados" },
    { value: clubs.data.length, label: "Clubes publicando" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-court/10 bg-court text-white">
      <CourtLinesSvg strokeWidth={2} className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.08]" />
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-3 gap-6 px-6 py-14 md:py-16">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl font-black text-ball-bright md:text-5xl">
              <CountUp to={s.value} />
            </p>
            <p className="mt-1 text-sm font-medium text-white/70">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
