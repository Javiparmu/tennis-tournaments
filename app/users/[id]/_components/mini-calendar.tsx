"use client";

import { Button, Card } from "@heroui/react";
import type { UserMatchActivityItem } from "@/lib/types";
import {
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
  matchesByDay: Record<string, UserMatchActivityItem[]>;
  onModeChange: (mode: CalendarMode) => void;
  onDaySelect: (dayKey: string) => void;
  onAnchorDateChange: (date: Date) => void;
};

export function MiniCalendar({
  mode,
  anchorDate,
  selectedDayKey,
  matchesByDay,
  onModeChange,
  onDaySelect,
  onAnchorDateChange,
}: MiniCalendarProps) {
  const weekdayLabels = getWeekdayLabels();
  const days = getCalendarDays(mode, anchorDate, matchesByDay);

  return (
    <Card className="border border-zinc-200 bg-white shadow-sm">
      <Card.Header className="flex items-center justify-between gap-4 p-5 pb-0">
        <div>
          <p className="text-lg font-semibold">Match calendar</p>
          <p className="text-sm text-zinc-500">Completed and walkover matches in the selected range.</p>
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
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" className="text-zinc-700" onPress={() => onAnchorDateChange(moveAnchorDate(anchorDate, mode, -1))}>
            Previous
          </Button>
          <p className="text-sm font-medium text-zinc-700">{formatRangeLabel(mode, anchorDate)}</p>
          <Button variant="ghost" className="text-zinc-700" onPress={() => onAnchorDateChange(moveAnchorDate(anchorDate, mode, 1))}>
            Next
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {weekdayLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const winCount = day.matches.filter((match) => match.result === "WIN").length;
            const lossCount = day.matches.length - winCount;
            const isSelected = day.key === selectedDayKey;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => onDaySelect(day.key)}
                className={[
                  "min-h-20 rounded-2xl border px-2 py-2 text-left transition",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 hover:border-emerald-300 hover:bg-white",
                  day.inCurrentPeriod ? "text-zinc-900" : "text-zinc-400",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{day.date.getDate()}</span>
                  {day.matches.length > 0 ? (
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {day.matches.length}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-1">
                  {winCount > 0 ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      {winCount}W
                    </span>
                  ) : null}
                  {lossCount > 0 ? (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                      {lossCount}L
                    </span>
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
