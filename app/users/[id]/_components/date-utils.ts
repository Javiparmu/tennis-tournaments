import type { UserMatchActivityItem } from "@/lib/types";

export type CalendarMode = "month" | "week";

export type CalendarDay = {
  date: Date;
  key: string;
  inCurrentPeriod: boolean;
  matches: UserMatchActivityItem[];
};

const weekdayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
const dayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function copyDate(value: Date) {
  return new Date(value.getTime());
}

function normalizeLocalStart(value: Date) {
  const next = copyDate(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function normalizeLocalEnd(value: Date) {
  const next = copyDate(value);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function toLocalDayKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalDayKeyFromIso(value: string) {
  return toLocalDayKey(new Date(value));
}

export function startOfLocalWeek(value: Date) {
  const start = normalizeLocalStart(value);
  const dayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayOffset);
  return start;
}

export function endOfLocalWeek(value: Date) {
  const end = startOfLocalWeek(value);
  end.setDate(end.getDate() + 6);
  return normalizeLocalEnd(end);
}

export function getVisibleRange(mode: CalendarMode, anchorDate: Date) {
  if (mode === "week") {
    const from = startOfLocalWeek(anchorDate);
    const to = endOfLocalWeek(anchorDate);
    return {
      from,
      to,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
    };
  }

  const from = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    from,
    to,
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
  };
}

export function moveAnchorDate(anchorDate: Date, mode: CalendarMode, direction: -1 | 1) {
  const next = copyDate(anchorDate);
  if (mode === "week") {
    next.setDate(next.getDate() + direction * 7);
    return next;
  }
  next.setMonth(next.getMonth() + direction);
  return next;
}

export function formatRangeLabel(mode: CalendarMode, anchorDate: Date) {
  if (mode === "month") {
    return monthFormatter.format(anchorDate);
  }

  const weekStart = startOfLocalWeek(anchorDate);
  const weekEnd = endOfLocalWeek(anchorDate);
  return `${dayFormatter.format(weekStart)} - ${dayFormatter.format(weekEnd)}`;
}

export function getWeekdayLabels() {
  const weekStart = startOfLocalWeek(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const day = copyDate(weekStart);
    day.setDate(weekStart.getDate() + index);
    return weekdayFormatter.format(day);
  });
}

export function buildMatchesByDay(matches: UserMatchActivityItem[]) {
  return matches.reduce<Record<string, UserMatchActivityItem[]>>((acc, match) => {
    const key = getLocalDayKeyFromIso(match.completedAt);
    acc[key] = [...(acc[key] ?? []), match].sort(
      (left, right) => +new Date(left.completedAt) - +new Date(right.completedAt),
    );
    return acc;
  }, {});
}

export function getCalendarDays(
  mode: CalendarMode,
  anchorDate: Date,
  matchesByDay: Record<string, UserMatchActivityItem[]>,
) {
  return mode === "week"
    ? buildWeekDays(anchorDate, matchesByDay)
    : buildMonthDays(anchorDate, matchesByDay);
}

function buildWeekDays(anchorDate: Date, matchesByDay: Record<string, UserMatchActivityItem[]>) {
  const start = startOfLocalWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => {
    const day = copyDate(start);
    day.setDate(start.getDate() + index);
    const key = toLocalDayKey(day);
    return {
      date: day,
      key,
      inCurrentPeriod: true,
      matches: matchesByDay[key] ?? [],
    } satisfies CalendarDay;
  });
}

function buildMonthDays(anchorDate: Date, matchesByDay: Record<string, UserMatchActivityItem[]>) {
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const gridStart = startOfLocalWeek(monthStart);

  return Array.from({ length: 42 }, (_, index) => {
    const day = copyDate(gridStart);
    day.setDate(gridStart.getDate() + index);
    const key = toLocalDayKey(day);
    return {
      date: day,
      key,
      inCurrentPeriod: day.getMonth() === anchorDate.getMonth(),
      matches: matchesByDay[key] ?? [],
    } satisfies CalendarDay;
  });
}

export function isDayKeyWithinRange(dayKey: string, from: Date, to: Date) {
  const dayStart = new Date(`${dayKey}T00:00:00`);
  return dayStart >= normalizeLocalStart(from) && dayStart <= normalizeLocalStart(to);
}

export function formatDayHeading(dayKey: string) {
  return dayFormatter.format(new Date(`${dayKey}T12:00:00`));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function countWins(matches: UserMatchActivityItem[]) {
  return matches.filter((match) => match.result === "WIN").length;
}
