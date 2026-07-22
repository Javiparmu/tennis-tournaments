import type { RatingEvent } from "@courtrank/core";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";
import { colors } from "../theme/tokens";

// Room for the min/max labels on the left, and enough vertical padding that the
// end dot's ring never clips against the frame.
const LABEL_W = 30;
const PAD_X = 8;
const PAD_Y = 10;

// Elo curve: gradient area fill under a lime line, three reference lines, and a dot
// on the current rating. Sorts events chronologically and scales to the value range.
// (The web profile uses a richer geometry helper; this is mobile v1.)
//
// The line is lime rather than court green because on the dark canvas the green
// reads as near-black against the card. The reference lines are the hairline `line`
// token, and the end dot's ring is the card `surface` it sits on — a white ring
// would be the brightest thing on the screen.
export function RatingChart({
  events,
  width,
  height = 140,
}: {
  events: RatingEvent[];
  width: number;
  height?: number;
}) {
  if (events.length < 2 || width <= 0) return null;

  const points = [...events].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const values = points.map((event) => event.ratingAfter);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerW = width - LABEL_W - PAD_X;
  const innerH = height - PAD_Y * 2;
  const bottom = PAD_Y + innerH;

  const coords = points.map((event, index) => {
    const x = LABEL_W + (index / (points.length - 1)) * innerW;
    const y = PAD_Y + (1 - (event.ratingAfter - min) / range) * innerH;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  // The fill is the same curve, dropped to the baseline and closed.
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${bottom} L${coords[0][0].toFixed(1)} ${bottom} Z`;
  const last = coords[coords.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="ratingArea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.lime} stopOpacity={0.18} />
          <Stop offset="1" stopColor={colors.lime} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {[PAD_Y, PAD_Y + innerH / 2, bottom].map((y) => (
        <Line key={y} x1={LABEL_W} y1={y} x2={width - PAD_X} y2={y} stroke={colors.lineStrong} strokeWidth={1} />
      ))}

      <Path d={area} fill="url(#ratingArea)" />
      <Path d={line} stroke={colors.lime} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* The ring lifts the current rating off the curve where the two cross. */}
      <Circle cx={last[0]} cy={last[1]} r={4} fill={colors.lime} stroke={colors.surface} strokeWidth={2} />

      <SvgText x={0} y={PAD_Y + 3} fill={colors.inkFaint} fontSize={10} fontFamily="GeistMono_400Regular">
        {max}
      </SvgText>
      <SvgText x={0} y={bottom + 3} fill={colors.inkFaint} fontSize={10} fontFamily="GeistMono_400Regular">
        {min}
      </SvgText>
    </Svg>
  );
}
