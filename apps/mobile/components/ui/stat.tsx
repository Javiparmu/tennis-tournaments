import { Text, View } from "react-native";

type StatProps = {
  value: string | number;
  label: string;
  /** Lime the value — for the one figure that matters most in a strip. */
  accent?: boolean;
  /** `lg` swaps the mono figure for the display-black bento treatment. */
  size?: "md" | "lg";
};

// `md` is the mono strip figure; `lg` is the bento hero figure, so bento cards and
// profile strips share one anatomy (value above a mono micro-label).
const VALUE_CLASS = {
  md: "font-mono-bold text-2xl",
  lg: "font-display-black text-4xl tracking-tight",
} as const;

// Single figure + mono micro-label. Digits are tabular so a strip of stats keeps
// its columns steady as values change.
export function Stat({ value, label, accent = false, size = "md" }: StatProps) {
  return (
    <View className="gap-0.5">
      <Text
        className={`${VALUE_CLASS[size]} ${accent ? "text-lime" : "text-ink"}`}
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
      <Text className="font-mono text-[10px] uppercase tracking-[1.8px] text-ink-faint">{label}</Text>
    </View>
  );
}
