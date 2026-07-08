import { describe, expect, it } from "vitest";
import type { RatingEvent } from "@/models";
import { buildRatingChartGeometry } from "./rating-chart-geometry";

function event(partial: Partial<RatingEvent> & { delta: number; ratingAfter: number }): RatingEvent {
  return {
    id: 1,
    matchId: null,
    tournamentId: null,
    reason: "MATCH",
    createdAt: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

describe("buildRatingChartGeometry", () => {
  it("returns null when there are no events", () => {
    expect(buildRatingChartGeometry([])).toBeNull();
  });

  it("prepends a synthetic origin at the pre-first-event rating", () => {
    const geo = buildRatingChartGeometry([event({ delta: 24, ratingAfter: 1024 })]);
    expect(geo).not.toBeNull();
    const origin = geo?.points[0];
    expect(origin?.isOrigin).toBe(true);
    // 1024 - 24 = 1000; delta/date are null on the origin.
    expect(origin?.rating).toBe(1000);
    expect(origin?.delta).toBeNull();
    expect(origin?.date).toBeNull();
    // One origin + one event.
    expect(geo?.points).toHaveLength(2);
  });

  it("maps a higher rating to a smaller y (up is up)", () => {
    const geo = buildRatingChartGeometry([
      event({ id: 1, delta: 20, ratingAfter: 1020 }),
      event({ id: 2, delta: 40, ratingAfter: 1060 }),
    ]);
    const [origin, low, high] = geo?.points ?? [];
    expect(origin.rating).toBe(1000);
    expect(high.rating).toBe(1060);
    // Highest rating is nearest the top => smallest y.
    expect(high.y).toBeLessThan(low.y);
    expect(low.y).toBeLessThan(origin.y);
  });

  it("tracks the peak index across the full series", () => {
    const geo = buildRatingChartGeometry([
      event({ id: 1, delta: 30, ratingAfter: 1030 }),
      event({ id: 2, delta: 50, ratingAfter: 1080 }),
      event({ id: 3, delta: -25, ratingAfter: 1055 }),
    ]);
    // points: [origin 1000, 1030, 1080(peak), 1055]
    expect(geo?.peakIndex).toBe(2);
    expect(geo?.max).toBe(1080);
    expect(geo?.min).toBe(1000);
  });

  it("does not divide by zero on a flat series", () => {
    const geo = buildRatingChartGeometry([
      event({ id: 1, delta: 0, ratingAfter: 1000 }),
      event({ id: 2, delta: 0, ratingAfter: 1000 }),
    ]);
    expect(geo).not.toBeNull();
    for (const point of geo?.points ?? []) {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
    }
  });

  it("closes the area path back to the baseline", () => {
    const geo = buildRatingChartGeometry([event({ delta: 12, ratingAfter: 1012 })]);
    expect(geo?.areaPath.endsWith("Z")).toBe(true);
    expect(geo?.areaPath).toContain(String(geo?.baselineY));
  });
});
