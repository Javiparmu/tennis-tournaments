"use client";

import { Chip } from "@heroui/react";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useTournamentsQuery } from "@/data/queries";
import { dayMonth } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TournamentsPage() {
  const { data: tournaments = [], isLoading } = useTournamentsQuery();

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-court/10 bg-white p-8 shadow-sm">
          <div className="court-lines absolute inset-0 -z-10 opacity-60" />
          <div className="glow absolute -right-16 -top-20 -z-10 h-56 w-56" />
          <p className="font-display text-sm font-bold uppercase tracking-wide text-court">Inscripción abierta</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">Próximos torneos</h1>
          <p className="mt-3 max-w-xl text-zinc-600">
            Eventos publicados por los clubes. Elige uno, inscríbete y añádelo a tu temporada.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-100/70"
              />
            ))}

          {!isLoading &&
            tournaments.map((tournament, i) => {
              const s = surfaceStyle(tournament.surface);
              const { day, month } = dayMonth(tournament.startDate);
              return (
                <FadeContent key={tournament.id} delay={(i % 3) * 0.08}>
                  <Link href={`/tournaments/${tournament.id}`}>
                    <SpotlightCard className="h-full rounded-2xl border border-court/10 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <span className="absolute inset-x-0 top-0 h-1" style={{ background: s.hex }} />
                      <div className="flex h-full flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center rounded-xl bg-court/5 px-3 py-1">
                              <span className="font-display text-xl font-black leading-none">{day}</span>
                              <span className="text-[10px] font-bold tracking-wider text-zinc-500">{month}</span>
                            </div>
                            <div>
                              <h2 className="font-display text-lg font-bold">{tournament.name}</h2>
                              <p className="text-sm text-zinc-500">Club #{tournament.clubId}</p>
                            </div>
                          </div>
                          <Chip size="sm" variant="soft" className={`${s.bg} ${s.text} border ${s.border}`}>
                            {s.label}
                          </Chip>
                        </div>

                        <div className="mt-auto grid gap-2 text-sm text-zinc-600">
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-court" />
                            {tournament.description ?? "Sin descripción"}
                          </p>
                          <p className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-court" />
                            {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}
                          </p>
                          <span className="flex items-center gap-1 pt-1 font-medium text-court">
                            Ver detalles
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                </FadeContent>
              );
            })}
        </div>

        {!isLoading && tournaments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-court/20 bg-white p-10 text-center">
            <p className="font-display text-lg font-bold">Aún no hay torneos</p>
            <p className="mt-1 text-sm text-zinc-500">
              Los clubes todavía no han publicado eventos aquí.{" "}
              <Link href="/sign-up" className="font-medium text-court hover:text-court-hover">
                Organiza uno →
              </Link>
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
