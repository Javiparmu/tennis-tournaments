import { describe, expect, it } from "vitest";
import { getCalendarDays, isDayKeyWithinRange, startOfLocalWeek, toLocalDayKey } from "./date-utils";

describe("toLocalDayKey", () => {
  it("formats a local date as YYYY-MM-DD with zero padding", () => {
    expect(toLocalDayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toLocalDayKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("startOfLocalWeek", () => {
  // 2026-01-05 is a Monday; the week runs Mon..Sun.
  it("returns the Monday for a mid-week date", () => {
    // 2026-01-07 is a Wednesday.
    const start = startOfLocalWeek(new Date(2026, 0, 7, 15, 30));
    expect(toLocalDayKey(start)).toBe("2026-01-05");
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it("treats Sunday as the last day of the week (still maps to the prior Monday)", () => {
    // 2026-01-11 is a Sunday.
    expect(toLocalDayKey(startOfLocalWeek(new Date(2026, 0, 11)))).toBe("2026-01-05");
  });

  it("returns the same Monday when given a Monday", () => {
    expect(toLocalDayKey(startOfLocalWeek(new Date(2026, 0, 5)))).toBe("2026-01-05");
  });
});

describe("buildMonthDays (via getCalendarDays)", () => {
  it("always returns a 42-cell grid starting on a Monday", () => {
    const days = getCalendarDays("month", new Date(2026, 0, 15), {}, {});
    expect(days).toHaveLength(42);
    // First cell is the Monday of the week containing the 1st.
    expect(days[0].date.getDay()).toBe(1);
    // The grid spans the month, so at least one cell is inside it.
    expect(days.some((day) => day.inCurrentPeriod)).toBe(true);
  });

  it("flags cells outside the anchor month as not in the current period", () => {
    const days = getCalendarDays("month", new Date(2026, 0, 15), {}, {});
    const outside = days.filter((day) => !day.inCurrentPeriod);
    expect(outside.length).toBeGreaterThan(0);
    for (const day of outside) {
      expect(day.date.getMonth()).not.toBe(0);
    }
  });
});

describe("isDayKeyWithinRange", () => {
  const from = new Date(2026, 0, 10, 9, 0);
  const to = new Date(2026, 0, 20, 18, 0);

  it("includes the range boundary days (inclusive on both ends)", () => {
    expect(isDayKeyWithinRange("2026-01-10", from, to)).toBe(true);
    expect(isDayKeyWithinRange("2026-01-20", from, to)).toBe(true);
    expect(isDayKeyWithinRange("2026-01-15", from, to)).toBe(true);
  });

  it("excludes days just outside the range", () => {
    expect(isDayKeyWithinRange("2026-01-09", from, to)).toBe(false);
    expect(isDayKeyWithinRange("2026-01-21", from, to)).toBe(false);
  });
});
