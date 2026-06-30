"use client";

import { Chip } from "@heroui/react";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { useUpcomingCalendarQuery } from "@/data/queries";
import { formatDateRange } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

export function TournamentGrid() {
  const { data: upcoming = [], isLoading } = useUpcomingCalendarQuery(6);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-court">Abiertos ahora</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-court-ink md:text-4xl">
            Próximos torneos
          </h2>
        </div>
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-1 text-sm font-semibold text-court hover:text-court-hover"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-100/70"
            />
          ))}

        {!isLoading &&
          upcoming.map((t) => {
            const s = surfaceStyle(t.surface);
            return (
              <Link key={t.id} href={`/tournaments/${t.id}`}>
                <SpotlightCard className="h-full rounded-2xl border border-court/10 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold text-court-ink">{t.name}</p>
                        <p className="text-sm text-zinc-500">Club #{t.clubId}</p>
                      </div>
                      <Chip size="sm" variant="soft" className={`${s.bg} ${s.text} border ${s.border}`}>
                        {s.label}
                      </Chip>
                    </div>
                    <div className="mt-auto space-y-2 text-sm text-zinc-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-court" />
                        {formatDateRange(t.startDate, t.endDate)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-court" />
                        {t.description ?? "Detalles en la página del torneo"}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-court" />
                        Inscripción abierta
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}

        {!isLoading && upcoming.length === 0 && (
          <p className="text-sm text-zinc-500">No hay torneos próximos disponibles.</p>
        )}
      </div>
    </section>
  );
}
