"use client";

import { Button, Card, Dropdown, Label, Tooltip } from "@heroui/react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { JOIN_STATUS_LABEL, TOURNAMENT_STATUS_LABEL } from "@courtrank/core/lib/labels";
import { SURFACE_LABEL } from "@/lib/surface";
import type { ProfileCalendarDay, ProfileCalendarEvent } from "@courtrank/core/models";
import {
  buildCalendarSummariesByDay,
  buildEventsByDay,
  type CalendarMode,
  formatRangeLabel,
  getCalendarDays,
  getWeekdayLabels,
  moveAnchorDate,
} from "./date-utils";

type MiniCalendarProps = {
  mode: CalendarMode;
  anchorDate: Date;
  selectedDayKey: string;
  calendarDays: ProfileCalendarDay[];
  events: ProfileCalendarEvent[];
  onModeChange: (mode: CalendarMode) => void;
  onDaySelect: (dayKey: string) => void;
  onAnchorDateChange: (date: Date) => void;
};

const MODE_LABEL: Record<CalendarMode, string> = { month: "Mes", week: "Semana" };

export function MiniCalendar({
  mode,
  anchorDate,
  selectedDayKey,
  calendarDays,
  events,
  onModeChange,
  onDaySelect,
  onAnchorDateChange,
}: MiniCalendarProps) {
  const weekdayLabels = getWeekdayLabels();
  const summariesByDay = buildCalendarSummariesByDay(calendarDays);
  const eventsByDay = buildEventsByDay(events);
  const days = getCalendarDays(mode, anchorDate, summariesByDay, eventsByDay);

  return (
    <Card className="rounded-2xl border border-court/10 bg-white shadow-sm">
      <Card.Content className="gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Dropdown>
            <Dropdown.Trigger>
              <Button size="sm" variant="ghost" className="gap-1 text-stone-700">
                {MODE_LABEL[mode]}
                <ChevronDown className="h-4 w-4" aria-hidden />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-[150px]">
              <Dropdown.Menu
                selectionMode="single"
                selectedKeys={new Set([mode])}
                onSelectionChange={(keys) => {
                  if (keys === "all") return;
                  const next = keys.values().next().value as CalendarMode | undefined;
                  if (next) onModeChange(next);
                }}
              >
                <Dropdown.Item id="month" textValue="Mes">
                  <Label>Mes</Label>
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
                <Dropdown.Item id="week" textValue="Semana">
                  <Label>Semana</Label>
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-stone-700"
              onPress={() => onAnchorDateChange(moveAnchorDate(anchorDate, mode, -1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Anterior
            </Button>
            <p className="min-w-[7.5rem] text-center text-sm font-medium text-stone-700">
              {formatRangeLabel(mode, anchorDate)}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-stone-700"
              onPress={() => onAnchorDateChange(moveAnchorDate(anchorDate, mode, 1))}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-400">
          {weekdayLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const summary = day.summary;
            const isSelected = day.key === selectedDayKey;
            // Registrations are merged in client-side, so they live in events, not summary.
            const dayTournaments = day.events.filter((event) => event.eventType === "TOURNAMENT");

            return (
              // biome-ignore lint/a11y/useSemanticElements: calendar day cell holds badges/tooltips; a button can't nest that markup
              <div
                key={day.key}
                role="button"
                tabIndex={0}
                onClick={() => onDaySelect(day.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onDaySelect(day.key);
                  }
                }}
                className={[
                  "min-h-24 cursor-pointer rounded-2xl border px-2 py-2 text-left transition",
                  isSelected
                    ? "border-court bg-court/5 shadow-sm"
                    : "border-stone-200 bg-stone-50 hover:border-court/40 hover:bg-white",
                  day.inCurrentPeriod ? "text-stone-900" : "text-stone-400",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{day.date.getDate()}</span>
                  {summary ? (
                    <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {summary.totalCount}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {summary?.scheduledMatchCount ? (
                    <CountBadge className="bg-sky-100 text-sky-700" label={`${summary.scheduledMatchCount}S`} />
                  ) : null}
                  {summary?.liveMatchCount ? (
                    <CountBadge className="bg-amber-100 text-amber-700" label={`${summary.liveMatchCount}L`} />
                  ) : null}
                  {summary && summary.completedMatchCount + summary.walkoverMatchCount > 0 ? (
                    <CountBadge
                      className="bg-emerald-100 text-emerald-700"
                      label={`${summary.completedMatchCount + summary.walkoverMatchCount}P`}
                    />
                  ) : null}
                  {summary?.trainingCount ? (
                    <CountBadge className="bg-violet-100 text-violet-700" label={`${summary.trainingCount}T`} />
                  ) : null}
                </div>

                {dayTournaments.length ? <TournamentBadge events={dayTournaments} /> : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-court/10 pt-4 text-[11px] font-medium text-stone-500">
          <LegendBadge className="bg-sky-100 text-sky-700" label="Programado" />
          <LegendBadge className="bg-amber-100 text-amber-700" label="En juego" />
          <LegendBadge className="bg-emerald-100 text-emerald-700" label="Jugado" />
          <LegendBadge className="bg-violet-100 text-violet-700" label="Entrenamiento" />
          <LegendBadge className="bg-rose-100 text-rose-700" label="Torneo" />
        </div>
      </Card.Content>
    </Card>
  );
}

function CountBadge({ label, className }: { label: string; className: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>{label}</span>;
}

const tournamentDateFormatter = new Intl.DateTimeFormat("es-ES", { month: "short", day: "numeric" });

function formatTournamentRange(start: string, end: string) {
  const startLabel = tournamentDateFormatter.format(new Date(start));
  const endLabel = tournamentDateFormatter.format(new Date(end));
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

// Full-width registration bar with a HeroUI tooltip. HeroUI's tooltip renders in a
// portal, so it is not clipped by the calendar card and stays consistent with the rest
// of the UI. `delay` adds a short hover delay before it opens.
function TournamentBadge({ events }: { events: ProfileCalendarEvent[] }) {
  const label = events.length === 1 ? (events[0]?.tournament?.name ?? "Torneo") : `${events.length} torneos`;

  return (
    <Tooltip delay={400} closeDelay={80}>
      <Tooltip.Trigger className="mt-1 flex w-full cursor-pointer items-center gap-1 rounded-md bg-rose-100 px-1.5 py-1 text-left text-[10px] font-semibold text-rose-700 outline-none">
        🎾 <span className="truncate">{label}</span>
      </Tooltip.Trigger>
      <Tooltip.Content className="max-w-xs p-0">
        <div className="space-y-1.5 p-2.5 text-left text-xs text-court-ink" style={{ wordBreak: "normal" }}>
          {events.map((event) => {
            const tournament = event.tournament;
            if (!tournament) return null;
            return (
              <div key={event.eventId} className="border-b border-stone-200 pb-1.5 last:border-0 last:pb-0">
                <p className="font-semibold">{tournament.name}</p>
                <p className="mt-0.5 text-stone-500">
                  {formatTournamentRange(tournament.startDate, tournament.endDate)}
                  {tournament.surface ? ` · ${SURFACE_LABEL[tournament.surface] ?? tournament.surface}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">
                    {JOIN_STATUS_LABEL[tournament.status] ?? tournament.status}
                  </span>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                    {TOURNAMENT_STATUS_LABEL[tournament.tournamentStatus] ?? tournament.tournamentStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Tooltip.Content>
    </Tooltip>
  );
}

function LegendBadge({ label, className }: { label: string; className: string }) {
  return <span className={`rounded-full px-2 py-1 ${className}`}>{label}</span>;
}
