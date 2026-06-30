"use client";

import { CountUp } from "@/components/react-bits/CountUp";
import { useClubsQuery, usePlayersQuery, useTournamentsQuery } from "@/data/queries";

export function StatBand() {
  const tournaments = useTournamentsQuery();
  const players = usePlayersQuery();
  const clubs = useClubsQuery();

  const stats = [
    { value: tournaments.data?.length ?? 0, label: "Torneos publicados" },
    { value: players.data?.length ?? 0, label: "Jugadores registrados" },
    { value: clubs.data?.length ?? 0, label: "Clubes organizando" },
  ];

  return (
    <section className="border-y border-court/10 bg-court text-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-3 gap-6 px-6 py-10">
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
