import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { colors } from "../../theme/tokens";

const PAD_Y = 4;

// Bare trend line for the Elo card: no axes, no labels, no dot — the number beside
// it is the value, this only has to show the shape. The full-detail version with
// reference lines and min/max labels is components/rating-chart.tsx; that one is for
// the profile, where reading a specific rating off the curve is the point.
//
// Takes plain numbers in chronological order so the caller owns the sort — the
// rating-history API returns events, not a series.
export function Sparkline({
  values,
  width,
  height = 44,
  color = colors.lime,
}: {
  values: number[];
  width: number;
  height?: number;
  color?: string;
}) {
  if (values.length < 2 || width <= 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  // A flat series has zero range; without this the divide puts every point at NaN.
  const range = max - min || 1;
  const innerH = height - PAD_Y * 2;

  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = PAD_Y + (1 - (value - min) / range) * innerH;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width.toFixed(1)} ${height} L0 ${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.25} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#sparkArea)" />
      <Path d={line} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
