"use client";

import { Chip } from "@heroui/react";
import { CalendarX, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { EmptyState } from "@/components/empty-state";
import { useUserTournamentsQuery } from "@/data/queries";
import { countdown, dayMonth } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

// Upcoming tournaments this player is registered in, as a horizontal scroll-snap
// strip — mirrors components/landing/tournament-timeline.tsx.
export function RegisteredTournamentsCarousel({ userId }: { userId?: number }) {
  const { data = [], isLoading } = useUserTournamentsQuery(userId);
  const scroller = useRef<HTMLDivElement>(null);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return data
      .filter((t) => +new Date(t.startDate) >= now)
      .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  }, [data]);

  function scrollByCards(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  return (
    <div className="rounded-2xl border border-court/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-court-ink">Próximos torneos</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Desplazar a la izquierda"
            onClick={() => scrollByCards(-1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-court/15 text-court-ink transition-colors hover:bg-court/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Desplazar a la derecha"
            onClick={() => scrollByCards(1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-court/15 text-court-ink transition-colors hover:bg-court/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              key={i}
              className="h-28 w-[240px] shrink-0 animate-pulse rounded-xl border border-stone-100 bg-stone-100/70"
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
                className="group relative flex w-[240px] shrink-0 snap-start gap-3 rounded-xl border border-court/10 bg-white p-3 transition-shadow hover:shadow-md"
              >
                <span className="absolute inset-y-3 left-0 w-1 rounded-full" style={{ background: s.hex }} />
                <div className="ml-1 flex flex-col items-center justify-center rounded-lg bg-court/5 px-3 py-1">
                  <span className="font-display text-xl font-black leading-none text-court-ink">{day}</span>
                  <span className="text-[10px] font-bold tracking-wider text-stone-500">{month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-court-ink">{t.name}</p>
                  <p className="truncate text-xs text-stone-500">Club #{t.clubId}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Chip size="sm" variant="soft" className={`${s.bg} ${s.text} border ${s.border}`}>
                      {s.label}
                    </Chip>
                    <span className="text-xs font-medium text-court">{countdown(t.startDate)}</span>
                  </div>
                </div>
              </Link>
            );
          })}

        {!isLoading && upcoming.length === 0 && (
          <EmptyState
            size="compact"
            icon={CalendarX}
            title="Sin torneos próximos"
            description="No está inscrito en ningún torneo próximo."
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
