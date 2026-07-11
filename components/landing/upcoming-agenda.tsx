"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useClubNameMap, useUpcomingCalendarQuery } from "@/data/queries";
import { countdown, dayMonth } from "@/lib/format";
import { surfaceStyle } from "@/lib/surface";

// The upcoming-tournaments agenda: a dark brand panel sitting inside the light
// hero. It reads like a real calendar object — rows grouped under month headers,
// the nearest date ringed in lime — rather than a generic card strip. The panel
// chrome (radius, background, header) paints on first render and the body
// reserves a fixed height, so the skeleton→data swap causes zero layout shift.

// Full month name for the group headers ("JULIO", "AGOSTO"). lib/format only
// exposes the short form used inside a row's date block, so the long label is
// formatted locally here.
const MONTH_LONG = new Intl.DateTimeFormat("es-ES", { month: "long" });

// A "Próximos" panel must never show "hace 5d": drop anything already past
// (keeping today) and sort ascending so the soonest tournament leads. Pure so
// the memo stays cheap and predictable.
function upcomingSorted<T extends { startDate: string }>(rows: T[]): T[] {
  const floor = Date.now() - 86_400_000;
  return rows
    .filter((t) => +new Date(t.startDate) >= floor)
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
}

function monthKey(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function UpcomingAgenda() {
  const { data = [], isLoading } = useUpcomingCalendarQuery(6);
  const clubNames = useClubNameMap();

  const rows = useMemo(() => upcomingSorted(data).slice(0, 5), [data]);
  // Only label months when the list actually spans more than one — a single-month
  // agenda reads cleaner without a redundant header.
  const showMonths = useMemo(() => new Set(rows.map((t) => monthKey(t.startDate))).size > 1, [rows]);
  const nearestId = rows[0]?.id;

  return (
    <div className="rounded-3xl bg-court-night-deep p-5 shadow-xl md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg font-black tracking-tight text-white md:text-xl">Próximos torneos</h2>
          {!isLoading && rows.length > 0 ? (
            <span className="rounded-full bg-ball-bright/15 px-2 py-0.5 text-xs font-bold text-ball-bright">
              {rows.length}
            </span>
          ) : null}
        </div>
        <Link
          href="/tournaments"
          className="group inline-flex items-center gap-1 rounded-md text-sm font-semibold text-ball-bright hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright"
        >
          Ver todos
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </div>

      {/* Desktop: vertical agenda. Fixed-height body (5 × 70px rows + gaps) so the
          skeleton and the loaded list occupy the same space. */}
      <div className="hidden md:block">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                key={i}
                className="h-[70px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyAgenda className="h-[382px]" />
        ) : (
          <ol className="space-y-2">
            {rows.map((t, i) => {
              const prev = rows[i - 1];
              const startsMonth = showMonths && (!prev || monthKey(prev.startDate) !== monthKey(t.startDate));
              return (
                <li key={t.id}>
                  {startsMonth ? (
                    <p className="mb-1.5 mt-1 px-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {MONTH_LONG.format(new Date(t.startDate)).toUpperCase()}
                    </p>
                  ) : null}
                  <AgendaRow
                    id={t.id}
                    name={t.name}
                    club={clubNames.get(t.clubId) ?? "Club anfitrión"}
                    surface={t.surface}
                    startDate={t.startDate}
                    highlighted={t.id === nearestId}
                  />
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Mobile: horizontal snap strip — swipeable cards instead of the vertical
          list, which would push the hero too tall on a phone. */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                key={i}
                className="h-[120px] w-[280px] shrink-0 animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyAgenda className="h-[120px]" />
        ) : (
          <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {rows.map((t) => (
              <AgendaCard
                key={t.id}
                id={t.id}
                name={t.name}
                club={clubNames.get(t.clubId) ?? "Club anfitrión"}
                surface={t.surface}
                startDate={t.startDate}
                highlighted={t.id === nearestId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type RowProps = {
  id: number;
  name: string;
  club: string;
  surface: string | null;
  startDate: string;
  highlighted: boolean;
};

function AgendaRow({ id, name, club, surface, startDate, highlighted }: RowProps) {
  const s = surfaceStyle(surface);
  const { day, month } = dayMonth(startDate);
  return (
    <Link
      href={`/tournaments/${id}`}
      className={`group flex h-[70px] items-center gap-3 rounded-2xl border px-3 transition-all hover:-translate-y-0.5 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        highlighted
          ? "border-transparent bg-white/[0.06] ring-1 ring-ball-bright/50"
          : "border-white/10 bg-white/[0.04] hover:border-white/20"
      }`}
    >
      <span aria-hidden className="h-9 w-1 shrink-0 rounded-full" style={{ background: s.hex }} />
      <div className="flex w-9 shrink-0 flex-col items-center">
        <span className="font-display text-2xl font-black leading-none text-white">{day}</span>
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/45">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-white group-hover:text-ball-bright">{name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.hex }} />
          <span className="text-[11px] text-white/55">{s.label}</span>
          <span className="text-white/25">·</span>
          <span className="truncate text-[11px] text-white/45">{club}</span>
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold text-ball-bright">{countdown(startDate)}</span>
    </Link>
  );
}

function AgendaCard({ id, name, club, surface, startDate, highlighted }: RowProps) {
  const s = surfaceStyle(surface);
  const { day, month } = dayMonth(startDate);
  return (
    <Link
      href={`/tournaments/${id}`}
      className={`flex h-[120px] w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl border p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball-bright ${
        highlighted ? "border-transparent bg-white/[0.06] ring-1 ring-ball-bright/50" : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span aria-hidden className="mr-1 h-8 w-1 self-center rounded-full" style={{ background: s.hex }} />
          <span className="font-display text-2xl font-black leading-none text-white">{day}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">{month}</span>
        </div>
        <span className="text-xs font-semibold text-ball-bright">{countdown(startDate)}</span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold text-white">{name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.hex }} />
          <span className="text-[11px] text-white/55">{s.label}</span>
          <span className="text-white/25">·</span>
          <span className="truncate text-[11px] text-white/45">{club}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyAgenda({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 px-4 text-center ${className}`}
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
