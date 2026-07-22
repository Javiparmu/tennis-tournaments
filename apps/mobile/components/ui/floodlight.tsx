import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { colors } from "../../theme/tokens";

const SIZE = 280;

// The web hero's `.floodlight` is a CSS-blurred lime disc. RN has no CSS blur, so
// the falloff is baked into an SVG radial gradient instead: lime at the centre,
// fully transparent by 70% of the radius.
export function Floodlight({ size = SIZE }: { size?: number }) {
  const r = size / 2;
  return (
    <Svg
      width={size}
      height={size}
      pointerEvents="none"
      style={{ position: "absolute", top: -size * 0.28, right: -size * 0.18 }}
    >
      <Defs>
        <RadialGradient id="floodlight" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.lime} stopOpacity={0.16} />
          <Stop offset="0.7" stopColor={colors.lime} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={r} cy={r} r={r} fill="url(#floodlight)" />
    </Svg>
  );
}
