import type { RatingEvent } from "@courtrank/core";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../theme/tokens";

// Minimal Elo curve. Sorts events chronologically and draws a polyline scaled to
// the value range. (The web profile uses a richer geometry helper; this is the
// mobile v1.)
export function RatingChart({ events, width, height = 120 }: { events: RatingEvent[]; width: number; height?: number }) {
  if (events.length < 2 || width <= 0) return null;

  const points = [...events].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const values = points.map((event) => event.ratingAfter);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 8;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const coords = points.map((event, index) => {
    const x = pad + (index / (points.length - 1)) * innerW;
    const y = pad + (1 - (event.ratingAfter - min) / range) * innerH;
    return [x, y] as const;
  });

  const d = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1];

  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={colors.clay} strokeWidth={2} fill="none" />
      <Circle cx={last[0]} cy={last[1]} r={3.5} fill={colors.clay} />
    </Svg>
  );
}
