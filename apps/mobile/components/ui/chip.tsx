import { Text, View } from "react-native";

export type ChipTone = "neutral" | "success" | "live" | "danger" | "info" | "champion";

// Semantic, not surface-named: success = lime, live/attention = amber, danger =
// rose, neutral = surface-2. Tones are low-alpha tints with a saturated label — a
// solid fill at chip size would fight the lime accent for attention.
//
// `limeDark` is gone: it was the "legible on the night band" tone, and `success` now
// carries that job everywhere. `champion` stays as the solid scoreboard inversion —
// the same "the winner is a trophy, not a row" language as the ranking leader strip.
// It outranks `success`: one per table, never a state you can be in twice.
const TONES: Record<ChipTone, { bg: string; text: string }> = {
  neutral: { bg: "bg-surface-2", text: "text-ink-muted" },
  success: { bg: "bg-lime/15", text: "text-lime" },
  live: { bg: "bg-live/15", text: "text-live" },
  danger: { bg: "bg-danger/15", text: "text-danger" },
  info: { bg: "bg-info/15", text: "text-info" },
  champion: { bg: "bg-lime", text: "text-canvas" },
};

// Status/label pill (tournament status, join status, phase format, …).
export function Chip({ label, tone = "neutral" }: { label: string; tone?: ChipTone }) {
  const t = TONES[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${t.bg}`}>
      <Text className={`font-mono-medium text-[11px] uppercase tracking-[1px] ${t.text}`}>{label}</Text>
    </View>
  );
}
