import type { RatingEvent } from "@courtrank/core/models";

// Pure geometry for the rating-progression chart. Kept free of React/DOM so it is
// unit-testable (see rating-chart-geometry.test.ts). All coordinates are in the
// SVG viewBox space defined by `width`/`height`; the component scales that to the
// rendered pixel box via a plain viewBox (no distortion).

export type RatingChartPoint = {
  /** null on the synthetic origin; otherwise the backend rating event id. */
  id: number | null;
  /** viewBox x, spaced evenly by event index (a "match by match" climb, not a time axis). */
  x: number;
  /** viewBox y — higher rating sits nearer the top. */
  y: number;
  rating: number;
  /** null on the synthetic origin (the rating before the first event). */
  delta: number | null;
  reason: string | null;
  /** ISO timestamp; null on the origin. */
  date: string | null;
  isOrigin: boolean;
};

export type RatingChartGeometry = {
  width: number;
  height: number;
  points: RatingChartPoint[];
  linePath: string;
  areaPath: string;
  baselineY: number;
  min: number;
  max: number;
  peakIndex: number;
  yTicks: { value: number; y: number }[];
};

const PAD = { top: 30, right: 58, bottom: 30, left: 44 };
const WIDTH = 760;
const HEIGHT = 260;

function round5(value: number): number {
  return Math.round(value / 5) * 5;
}

/**
 * Build the chart geometry from rating events in **chronological (oldest-first)**
 * order. Prepends a synthetic origin point at the rating that preceded the first
 * event (`ratingAfter - delta`) so the line visibly starts from where the player
 * began, not from their first result. Returns `null` when there is nothing to plot.
 */
export function buildRatingChartGeometry(
  chronological: RatingEvent[],
  width = WIDTH,
  height = HEIGHT,
): RatingChartGeometry | null {
  if (chronological.length === 0) return null;

  const first = chronological[0];
  const origin: RatingChartPoint = {
    id: null,
    x: 0,
    y: 0,
    rating: first.ratingAfter - first.delta,
    delta: null,
    reason: null,
    date: null,
    isOrigin: true,
  };

  const raw: RatingChartPoint[] = [
    origin,
    ...chronological.map((event) => ({
      id: event.id,
      x: 0,
      y: 0,
      rating: event.ratingAfter,
      delta: event.delta,
      reason: event.reason,
      date: event.createdAt,
      isOrigin: false,
    })),
  ];

  const ratings = raw.map((p) => p.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);

  const px0 = PAD.left;
  const px1 = width - PAD.right;
  const py0 = PAD.top;
  const py1 = height - PAD.bottom;

  // Vertical scale with asymmetric headroom (more on top, so the peak label and
  // glow clear the frame). Guard a flat series so we never divide by zero.
  const span = Math.max(max - min, 40);
  const lo = min - span * 0.12;
  const hi = max + span * 0.2;
  const toY = (rating: number) => py1 - ((rating - lo) / (hi - lo)) * (py1 - py0);
  const toX = (index: number) => (raw.length === 1 ? (px0 + px1) / 2 : px0 + ((px1 - px0) * index) / (raw.length - 1));

  const points = raw.map((point, index) => ({ ...point, x: toX(index), y: toY(point.rating) }));

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const baselineY = py1;
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)} ${baselineY} L${points[0].x.toFixed(2)} ${baselineY} Z`;

  let peakIndex = 0;
  for (let i = 1; i < points.length; i += 1) {
    if (points[i].rating > points[peakIndex].rating) peakIndex = i;
  }

  // Up to three rounded y-axis ticks across the actual data band.
  const tickValues = Array.from(new Set([round5(min), round5((min + max) / 2), round5(max)])).sort((a, b) => a - b);
  const yTicks = tickValues.map((value) => ({ value, y: toY(value) }));

  return { width, height, points, linePath, areaPath, baselineY, min, max, peakIndex, yTicks };
}
