import { describe, expect, it } from "vitest";
import type { TournamentBasic } from "@/models";
import { upcomingCalendar } from "./tournaments";

const NOW = +new Date("2026-07-11T12:00:00Z");
const DAY = 86_400_000;

function tournament(id: number, startOffsetDays: number): TournamentBasic {
  return {
    id,
    name: `Torneo ${id}`,
    description: null,
    surface: null,
    status: "DRAFT",
    clubId: 1,
    championPlayerId: null,
    startDate: new Date(NOW + startOffsetDays * DAY).toISOString(),
    endDate: new Date(NOW + (startOffsetDays + 2) * DAY).toISOString(),
    createdAt: null,
    updatedAt: null,
  };
}

describe("upcomingCalendar", () => {
  it("drops past tournaments beyond the one-day grace window", () => {
    const rows = upcomingCalendar([tournament(1, -5), tournament(2, 3)], 10, NOW);
    expect(rows.map((t) => t.id)).toEqual([2]);
  });

  it("keeps a tournament that started earlier today", () => {
    const rows = upcomingCalendar([tournament(1, -0.5)], 10, NOW);
    expect(rows.map((t) => t.id)).toEqual([1]);
  });

  it("sorts soonest-first and truncates to the limit", () => {
    const rows = upcomingCalendar([tournament(1, 30), tournament(2, 1), tournament(3, 7)], 2, NOW);
    expect(rows.map((t) => t.id)).toEqual([2, 3]);
  });

  it("returns empty for an empty feed", () => {
    expect(upcomingCalendar([], 5, NOW)).toEqual([]);
  });
});
