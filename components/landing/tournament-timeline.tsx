"use client";

import { Chip } from "@heroui/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUpcomingCalendarQuery } from "@/data/queries";
import { countdown, dayMonth } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

// Horizontal, scroll-snapping strip of upcoming tournaments — the protagonist of
// the hero: the calendar IS the product, so it gets the visual weight.
// ponytail: native overflow-x scroll-snap (swipe on mobile, arrows on desktop)
// instead of a duplicated auto-scroll marquee — a marquee fights user scroll and
// breaks snap/click positions. Add the marquee later only if a passive demo is wanted.
export function TournamentTimeline() {
  const { data: upcoming = [], isLoading } = useUpcomingCalendarQuery(10);
  const scroller = useRef<HTMLDivElement>(null);
  // Only fade an edge when there is actually content scrolled off that side, so
  // the first card is never dimmed when the strip is at its start.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  // Recompute after data lands (content width changes) and on viewport resize.
  // biome-ignore lint/correctness/useExhaustiveDependencies: upcoming.length/isLoading gate the recompute when data lands, though updateEdges doesn't read them.
  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges, upcoming.length, isLoading]);

  function scrollByCards(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 348, behavior: "smooth" });
  }

  const maskImage = `linear-gradient(to right, ${atStart ? "black" : "transparent"}, black 24px, black calc(100% - 24px), ${atEnd ? "black" : "transparent"})`;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-black tracking-tight text-white md:text-2xl">
            Próximos torneos
          </h2>
          {!isLoading && upcoming.length > 0 ? (
            <span className="rounded-full bg-ball-bright/15 px-2.5 py-0.5 text-xs font-bold text-ball-bright">
              {upcoming.length}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/tournaments"
            className="group mr-2 inline-flex items-center gap-1 rounded-md text-sm font-semibold text-ball-bright hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            aria-label="Desplazar a la izquierda"
            onClick={() => scrollByCards(-1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Desplazar a la derecha"
            onClick={() => scrollByCards(1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Edge fade signals there is more to scroll without adding chrome. The
          vertical padding gives the cards' hover lift + shadow room so the
          scroll container's overflow clip (forced by overflow-x) does not crop
          them. Negative margin keeps the panel's inner spacing unchanged. */}
      <div
        ref={scroller}
        onScroll={updateEdges}
        style={{ WebkitMaskImage: maskImage, maskImage }}
        className="-mx-2 -mb-3 -mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-2 px-2 pb-3 pt-3 [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              key={i}
              className="h-[124px] w-[300px] shrink-0 animate-pulse rounded-2xl border border-white/10 bg-white/10"
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
                className="group relative flex w-[300px] shrink-0 snap-start gap-4 rounded-2xl border border-court/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-ball-bright/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="absolute inset-y-4 left-0 w-1 rounded-full" style={{ background: s.hex }} />
                <div className="ml-1.5 flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-court/5 py-2">
                  <span className="font-display text-2xl font-black leading-none text-court-ink">{day}</span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{month}</span>
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="truncate font-display text-base font-bold text-court-ink group-hover:text-court">
                    {t.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">Club #{t.clubId}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <Chip size="sm" variant="soft" className={`${s.bg} ${s.text} border ${s.border}`}>
                      {s.label}
                    </Chip>
                    <span className="text-xs font-semibold text-court">{countdown(t.startDate)}</span>
                  </div>
                </div>
              </Link>
            );
          })}

        {!isLoading && upcoming.length === 0 && (
          <div className="flex h-[124px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-center">
            <p className="text-sm text-white/70">Aún no hay torneos próximos.</p>
            <Link href="/tournaments" className="text-sm font-semibold text-ball-bright hover:text-white">
              Ver todos los torneos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
