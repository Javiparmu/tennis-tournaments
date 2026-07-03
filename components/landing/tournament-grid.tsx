"use client";

import { Chip } from "@heroui/react";
import { ArrowRight, Building2, Info } from "lucide-react";
import Link from "next/link";
import { ClubContactCta } from "@/components/club-contact-modal";
import { FadeContent } from "@/components/react-bits/FadeContent";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { useUpcomingCalendarQuery } from "@/data/queries";
import { countdown, dayMonth, formatDateRange } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";
import type { TournamentStatus } from "@/models/tournament";
import { SectionHeading } from "./section-heading";

// Honest status labels — the API has no "registration open" state, so we never
// assert it; we describe where the tournament is in its lifecycle instead.
const STATUS_LABEL: Record<TournamentStatus, string> = {
  DRAFT: "Próximamente",
  STARTED: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  ABANDONED: "Cancelado",
};

export function TournamentGrid() {
  const { data: upcoming = [], isLoading } = useUpcomingCalendarQuery(6);

  return (
    <section aria-labelledby="grid-heading" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
      <div className="mb-8 flex items-end justify-between gap-4">
        <FadeContent>
          <SectionHeading
            id="grid-heading"
            eyebrow="Abiertos ahora"
            title="Elige tu próximo cuadro."
            accent="próximo cuadro."
          />
        </FadeContent>
        <Link
          href="/tournaments"
          className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-court hover:text-court-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
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
              className="h-52 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-100/70"
            />
          ))}

        {!isLoading &&
          upcoming.map((t) => {
            const s = surfaceStyle(t.surface);
            const { day, month } = dayMonth(t.startDate);
            return (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court"
              >
                <SpotlightCard className="relative h-full rounded-2xl border border-court/10 bg-white shadow-sm transition-shadow hover:shadow-md">
                  {/* Surface-colored scorecard edge. */}
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
                        <p className="truncate font-display text-lg font-bold text-court-ink">{t.name}</p>
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
                        <span className="truncate">{t.description ?? "Detalles en la página del torneo"}</span>
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">{formatDateRange(t.startDate, t.endDate)}</span>
                        <span className="rounded-full bg-court/5 px-2 py-0.5 text-xs font-semibold text-court">
                          {t.status === "DRAFT" ? countdown(t.startDate) : STATUS_LABEL[t.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}

        {!isLoading && upcoming.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-court/20 bg-white p-8 text-center">
            <p className="text-sm text-zinc-600">Ahora mismo no hay torneos abiertos. Vuelve pronto.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-1 text-sm font-semibold text-court hover:text-court-hover"
              >
                Ver el calendario completo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <ClubContactCta className="text-sm font-medium text-zinc-500 transition-colors hover:text-court">
                ¿Tienes un club? Publica el tuyo.
              </ClubContactCta>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
