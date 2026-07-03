"use client";

import { Chip } from "@heroui/react";
import { ArrowRight, Building2, CalendarDays, Info } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useTournamentsQuery } from "@/data/queries";
import { countdown, dayMonth, formatDateRange } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";
import type { TournamentStatus } from "@/models/tournament";

const STATUS_LABEL: Record<TournamentStatus, string> = {
  DRAFT: "Próximamente",
  STARTED: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  ABANDONED: "Cancelado",
};

export default function TournamentsPage() {
  const { data: tournaments = [], isLoading } = useTournamentsQuery();

  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-10">
          <PageHero
            eyebrow="Inscripción abierta"
            title="Próximos torneos"
            accent=" torneos"
            subtitle="Eventos publicados por los clubes. Elige uno, inscríbete y añádelo a tu temporada."
          />
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
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
                  >
                    <SpotlightCard className="relative h-full rounded-2xl border border-court/10 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                        style={{ background: s.hex }}
                      />
                      <div className="flex h-full flex-col gap-4 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-court/5 py-2">
                            <span className="font-display text-2xl font-black leading-none text-court-ink">{day}</span>
                            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              {month}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="truncate font-display text-lg font-bold text-court-ink">{tournament.name}</h2>
                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-500">
                              <Building2 className="h-3.5 w-3.5" />
                              Club anfitrión
                            </p>
                          </div>
                          <Chip size="sm" variant="soft" className={`${s.bg} ${s.text} shrink-0 border ${s.border}`}>
                            {s.label}
                          </Chip>
                        </div>

                        <div className="mt-auto space-y-2 text-sm text-zinc-600">
                          <p className="flex items-center gap-2">
                            <Info className="h-4 w-4 shrink-0 text-court" />
                            <span className="truncate">{tournament.description ?? "Detalles en la página del torneo"}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs text-zinc-500">
                              <CalendarDays className="h-4 w-4 shrink-0 text-court" />
                              {formatDateRange(tournament.startDate, tournament.endDate)}
                            </span>
                            <span className="rounded-full bg-court/5 px-2 py-0.5 text-xs font-semibold text-court">
                              {tournament.status === "DRAFT"
                                ? countdown(tournament.startDate)
                                : STATUS_LABEL[tournament.status]}
                            </span>
                          </div>
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
