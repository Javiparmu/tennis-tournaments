"use client";

import { Button, Card } from "@heroui/react";
import type { ProfileCalendarDay, ProfileCalendarEvent } from "@/models";
import {
  type CalendarMode,
  buildCalendarSummariesByDay,
  buildEventsByDay,
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
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <Card.Header className="flex items-center justify-between gap-4 p-5 pb-0">
        <div>
          <p className="text-lg font-semibold">Profile calendar</p>
          <p className="text-sm text-zinc-500">Matches and training sessions in the selected range.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "month" ? "primary" : "ghost"}
            className={mode === "month" ? "bg-emerald-600 text-white" : "text-zinc-700"}
            onPress={() => onModeChange("month")}
          >
            Month
          </Button>
          <Button
            variant={mode === "week" ? "primary" : "ghost"}
            className={mode === "week" ? "bg-emerald-600 text-white" : "text-zinc-700"}
            onPress={() => onModeChange("week")}
          >
            Week
          </Button>
        </div>
      </Card.Header>
      <Card.Content className="gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" className="text-zinc-700" onPress={() => onAnchorDateChange(moveAnchorDate(anchorDate, mode, -1))}>
            Previous
          </Button>
          <p className="text-sm font-medium text-zinc-700">{formatRangeLabel(mode, anchorDate)}</p>
          <Button variant="ghost" className="text-zinc-700" onPress={() => onAnchorDateChange(moveAnchorDate(anchorDate, mode, 1))}>
            Next
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-medium text-zinc-500">
          <LegendBadge className="bg-sky-100 text-sky-700" label="Scheduled" />
          <LegendBadge className="bg-amber-100 text-amber-700" label="Live" />
          <LegendBadge className="bg-emerald-100 text-emerald-700" label="Played" />
          <LegendBadge className="bg-violet-100 text-violet-700" label="Training" />
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {weekdayLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const summary = day.summary;
            const isSelected = day.key === selectedDayKey;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => onDaySelect(day.key)}
                className={[
                  "min-h-24 rounded-2xl border px-2 py-2 text-left transition",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 hover:border-emerald-300 hover:bg-white",
                  day.inCurrentPeriod ? "text-zinc-900" : "text-zinc-400",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{day.date.getDate()}</span>
                  {summary ? (
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
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
              </button>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}

function CountBadge({ label, className }: { label: string; className: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>{label}</span>;
}

function LegendBadge({ label, className }: { label: string; className: string }) {
  return <span className={`rounded-full px-2 py-1 ${className}`}>{label}</span>;
}
