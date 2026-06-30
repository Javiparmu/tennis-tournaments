"use client";

import { Chip } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useUpcomingCalendarQuery } from "@/data/queries";
import { countdown, dayMonth } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

// Horizontal, scroll-snapping strip of upcoming tournaments — the "calendar at a
// glance" that sits inside the hero, above the fold.
// ponytail: native overflow-x scroll-snap (swipe on mobile, arrows on desktop)
// instead of a duplicated auto-scroll marquee — a marquee fights user scroll and
// breaks snap/click positions. Add the marquee later only if a passive demo is wanted.
export function TournamentTimeline() {
  const { data: upcoming = [], isLoading } = useUpcomingCalendarQuery(8);
  const scroller = useRef<HTMLDivElement>(null);

  function scrollByCards(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  return (
    <div className="rounded-2xl border border-court/10 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-court-ink">
          Próximamente
        </p>
        <div className="flex items-center gap-1">
          <Link href="/tournaments" className="mr-2 text-sm font-medium text-court hover:text-court-hover">
            Ver todos
          </Link>
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
              className="h-28 w-[240px] shrink-0 animate-pulse rounded-xl border border-zinc-100 bg-zinc-100/70"
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
                  <span className="text-[10px] font-bold tracking-wider text-zinc-500">{month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-court-ink">{t.name}</p>
                  <p className="truncate text-xs text-zinc-500">Club #{t.clubId}</p>
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
          <p className="px-1 py-6 text-sm text-zinc-500">Aún no hay torneos próximos — vuelve pronto.</p>
        )}
      </div>
    </div>
  );
}
