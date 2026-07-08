"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { DataCard } from "@/components/data-card";
import type { ProfileCalendarDay, ProfileCalendarEvent } from "@/models";
import { buildCalendarSummariesByDay, buildEventsByDay, startOfLocalWeek, toLocalDayKey } from "./date-utils";

const WEEKDAY = new Intl.DateTimeFormat("es-ES", { weekday: "short" });

// Current-week strip for the Resumen bento. Day cards are a fixed height (so the card
// stays compact and never stretches to a tall sibling) and lay out as a horizontal
// scroll-snap carousel — on wide layouts the seven fit; when the card is narrow they
// overflow and the chevrons page through them. Deep interaction (month view, day
// preview) lives in the Calendario tab, which the header links to.
export function WeekStripCard({
  calendarDays,
  events,
  loading,
}: {
  calendarDays: ProfileCalendarDay[];
  events: ProfileCalendarEvent[];
  loading: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const summariesByDay = buildCalendarSummariesByDay(calendarDays);
  const eventsByDay = buildEventsByDay(events);
  const weekStart = startOfLocalWeek(new Date());
  const todayKey = toLocalDayKey(new Date());

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart.getTime());
    date.setDate(weekStart.getDate() + index);
    const key = toLocalDayKey(date);
    const summary = summariesByDay[key] ?? null;
    const dayEvents = eventsByDay[key] ?? [];
    return { key, date, summary, count: summary?.totalCount ?? dayEvents.length, isToday: key === todayKey };
  });

  function scrollByCards(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  }

  // shrink-0 + a share-of-width basis so the seven cards fill the row when it's wide
  // and overflow (scroll) when it's narrow; min-w keeps each card legible either way.
  const cardBase =
    "flex h-[120px] shrink-0 basis-[calc((100%-4.5rem)/7)] min-w-[84px] snap-start flex-col items-center justify-between rounded-2xl border p-3 text-center transition";

  return (
    <DataCard
      title="Esta semana"
      action={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Días anteriores"
              onClick={() => scrollByCards(-1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-court/15 text-court-ink transition-colors hover:bg-court/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Días siguientes"
              onClick={() => scrollByCards(1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-court/15 text-court-ink transition-colors hover:bg-court/5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Link
            href="?tab=calendario"
            scroll={false}
            className="inline-flex items-center gap-1 text-sm font-semibold text-court transition-colors hover:text-court-hover"
          >
            Ver calendario
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="flex gap-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
              key={i}
              className="h-[120px] shrink-0 basis-[calc((100%-4.5rem)/7)] min-w-[84px] animate-pulse rounded-2xl bg-stone-100"
            />
          ))}
        </div>
      ) : (
        <div
          ref={scroller}
          className="flex gap-3 overflow-x-auto pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {days.map((day) => (
            <Link
              key={day.key}
              href="?tab=calendario"
              scroll={false}
              className={`${cardBase} ${
                day.isToday
                  ? "border-court bg-court/5"
                  : "border-stone-200 bg-stone-50 hover:border-court/40 hover:bg-white"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                {WEEKDAY.format(day.date)}
              </span>
              <span
                className={`font-display text-3xl font-black leading-none tabular-nums ${
                  day.isToday ? "text-court" : "text-court-ink"
                }`}
              >
                {day.date.getDate()}
              </span>
              {day.count > 0 ? (
                <span className="inline-flex items-center rounded-full bg-court px-2 py-0.5 text-[11px] font-semibold text-ball-bright">
                  {day.count} {day.count === 1 ? "evento" : "eventos"}
                </span>
              ) : (
                <span className="text-[11px] text-stone-300" aria-hidden>
                  —
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </DataCard>
  );
}
