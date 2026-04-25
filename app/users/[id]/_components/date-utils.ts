import type { ProfileCalendarDay, ProfileCalendarEvent, UserProfileMatchEntry } from "@/lib/types";

export type CalendarMode = "month" | "week";
export type AgendaFilter = "ALL" | "MATCH" | "TRAINING";

export type CalendarDay = {
  date: Date;
  key: string;
  inCurrentPeriod: boolean;
  summary: ProfileCalendarDay | null;
  events: ProfileCalendarEvent[];
};

const weekdayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
const dayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const timeFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
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
      fromDate: toLocalDayKey(from),
      toDate: toLocalDayKey(to),
    };
  }

  const from = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    from,
    to,
    fromDate: toLocalDayKey(from),
    toDate: toLocalDayKey(to),
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

export function buildCalendarSummariesByDay(days: ProfileCalendarDay[]) {
  return days.reduce<Record<string, ProfileCalendarDay>>((acc, day) => {
    acc[day.date] = day;
    return acc;
  }, {});
}

export function buildEventsByDay(events: ProfileCalendarEvent[]) {
  return events.reduce<Record<string, ProfileCalendarEvent[]>>((acc, event) => {
    acc[event.date] = [...(acc[event.date] ?? []), event];
    return acc;
  }, {});
}

export function getCalendarDays(
  mode: CalendarMode,
  anchorDate: Date,
  summariesByDay: Record<string, ProfileCalendarDay>,
  eventsByDay: Record<string, ProfileCalendarEvent[]>,
) {
  return mode === "week"
    ? buildWeekDays(anchorDate, summariesByDay, eventsByDay)
    : buildMonthDays(anchorDate, summariesByDay, eventsByDay);
}

function buildWeekDays(
  anchorDate: Date,
  summariesByDay: Record<string, ProfileCalendarDay>,
  eventsByDay: Record<string, ProfileCalendarEvent[]>,
) {
  const start = startOfLocalWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => {
    const day = copyDate(start);
    day.setDate(start.getDate() + index);
    const key = toLocalDayKey(day);
    return {
      date: day,
      key,
      inCurrentPeriod: true,
      summary: summariesByDay[key] ?? null,
      events: eventsByDay[key] ?? [],
    } satisfies CalendarDay;
  });
}

function buildMonthDays(
  anchorDate: Date,
  summariesByDay: Record<string, ProfileCalendarDay>,
  eventsByDay: Record<string, ProfileCalendarEvent[]>,
) {
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
      summary: summariesByDay[key] ?? null,
      events: eventsByDay[key] ?? [],
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

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

export function getInitialSelectedDayKey(
  anchorDate: Date,
  rangeFrom: Date,
  rangeTo: Date,
  manualSelectedDayKey: string | null,
  eventsByDay: Record<string, ProfileCalendarEvent[]>,
) {
  if (manualSelectedDayKey && isDayKeyWithinRange(manualSelectedDayKey, rangeFrom, rangeTo)) {
    return manualSelectedDayKey;
  }

  return Object.keys(eventsByDay).sort()[0] ?? toLocalDayKey(anchorDate);
}

export function filterAgendaEvents(events: ProfileCalendarEvent[], filter: AgendaFilter) {
  if (filter === "ALL") return events;
  return events.filter((event) => event.eventType === filter);
}

export function countMatchOutcomes(events: ProfileCalendarEvent[]) {
  return events.reduce(
    (acc, event) => {
      if (event.eventType !== "MATCH" || !event.match) return acc;

      switch (event.match.status) {
        case "SCHEDULED":
          acc.scheduled += 1;
          break;
        case "LIVE":
          acc.live += 1;
          break;
        case "COMPLETED":
          acc.completed += 1;
          break;
        case "WALKOVER":
          acc.walkover += 1;
          break;
      }

      if (event.match.result === "WIN") {
        acc.wins += 1;
      }

      return acc;
    },
    { scheduled: 0, live: 0, completed: 0, walkover: 0, wins: 0 },
  );
}

export function countTrainingSessions(events: ProfileCalendarEvent[]) {
  return events.filter((event) => event.eventType === "TRAINING").length;
}

export function getMatchDisplayTime(match: UserProfileMatchEntry) {
  return match.completedAt ?? match.scheduledTime;
}
