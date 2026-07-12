"use client";

import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClubNameMap, useUpcomingCalendarQuery } from "@/data/queries";
import { countdown, dayMonth } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

// The upcoming-tournaments agenda: a single horizontal snap-strip rail used at
// every breakpoint. It rides the bottom of the dark night-stadium hero, over
// the grass, so the cards are glass — a dark blurred fill so they stay legible
// on the photo. The nearest tournament is promoted to a flat lime feature card
// (the same ball-bright as the marquee band right below the hero, so they read
// as one system); the rest follow as glass cards you swipe through.

const ARROW_BTN =
  "grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:border-ball-bright/50 hover:text-ball-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright disabled:pointer-events-none disabled:opacity-30";

export function UpcomingAgenda() {
  const { data = [], isLoading } = useUpcomingCalendarQuery(6);
  const clubNames = useClubNameMap();

  // The feed arrives future-only and soonest-first from getUpcomingCalendar.
  const rows = useMemo(() => data.slice(0, 5), [data]);

  const stripRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  // The strip only exists in the loaded branch, so re-attach when it mounts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-attach when the loaded strip mounts
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, isLoading, rows.length]);

  // Arrows exist because the scrollbar is hidden — mouse users otherwise can't
  // reach cards past the fold of the strip. Scroll one card per click (280px
  // card + 12px gap).
  const scrollByCard = (dir: -1 | 1) => stripRef.current?.scrollBy({ left: dir * 292, behavior: "smooth" });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-ball-bright/90">
            Próximos torneos
          </h2>
          {!isLoading && rows.length > 0 ? (
            <span className="rounded-full bg-ball-bright/15 px-2 py-0.5 text-[10px] font-bold text-ball-bright">
              {rows.length}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/tournaments"
            className="group inline-flex items-center gap-1 rounded-md text-sm font-semibold text-white/70 hover:text-ball-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
          {!isLoading && rows.length > 0 && (canPrev || canNext) ? (
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                aria-label="Anteriores"
                disabled={!canPrev}
                onClick={() => scrollByCard(-1)}
                className={ARROW_BTN}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Siguientes"
                disabled={!canNext}
                onClick={() => scrollByCard(1)}
                className={ARROW_BTN}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* The rail body is a fixed 120px tall across loading, empty, and loaded
          states so the skeleton→data swap causes zero layout shift. */}
      {isLoading ? (
        <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              key={i}
              className="h-[120px] w-[280px] shrink-0 animate-pulse rounded-2xl border border-white/15 bg-white/[0.08]"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyAgenda className="h-[120px]" />
      ) : (
        <div
          ref={stripRef}
          className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {rows.map((t, i) => (
            <AgendaCard
              key={t.id}
              id={t.id}
              name={t.name}
              club={clubNames.get(t.clubId) ?? "Club anfitrión"}
              surface={t.surface}
              startDate={t.startDate}
              featured={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type RowProps = {
  id: number;
  name: string;
  club: string;
  surface: string | null;
  startDate: string;
};

// The only card in the rail. The featured (soonest) one is a flat lime object;
// the rest are glass — backdrop-blur over a dark fill so they stay legible on
// the bright grass of the hero photo behind them.
function AgendaCard({ id, name, club, surface, startDate, featured }: RowProps & { featured: boolean }) {
  const s = surfaceStyle(surface);
  const { day, month } = dayMonth(startDate);
  return (
    <Link
      href={`/tournaments/${id}`}
      className={`flex h-[120px] w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright ${
        featured
          ? "bg-ball-bright text-court-ink shadow-xl shadow-black/40"
          : "border border-white/15 bg-court-night-deep/80 text-white backdrop-blur-xl shadow-xl shadow-black/40 hover:border-ball-bright/50 hover:bg-court-night-deep/90"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          {/* Lime date on the glass cards: the rail is a calendar, so the date is
              the anchor — and it echoes the featured card without competing. */}
          <span className={`font-display text-2xl font-black leading-none ${featured ? "" : "text-ball-bright"}`}>
            {day}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${featured ? "text-court-ink/60" : "text-white/45"}`}
          >
            {month}
          </span>
        </div>
        {featured ? (
          <span className="rounded-full bg-court-ink px-2 py-0.5 text-[11px] font-bold text-ball-bright">
            {countdown(startDate)}
          </span>
        ) : (
          <span className="text-xs font-semibold text-ball-bright">{countdown(startDate)}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold">{name}</p>
        <div
          className={`mt-1 flex items-center gap-1.5 text-[11px] ${featured ? "text-court-ink/70" : "text-white/55"}`}
        >
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.hex }} />
          <span>{s.label}</span>
          <span className={featured ? "text-court-ink/40" : "text-white/25"}>·</span>
          <span className={`truncate ${featured ? "" : "text-white/45"}`}>{club}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyAgenda({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-court-night-deep/40 px-4 text-center backdrop-blur-sm ${className}`}
    >
      <CalendarDays aria-hidden className="h-7 w-7 text-white/30" />
      <p className="text-sm text-white/70">Aún no hay torneos próximos.</p>
      <Link
        href="/tournaments"
        className="text-sm font-semibold text-ball-bright hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
      >
        Ver todos los torneos
      </Link>
    </div>
  );
}
