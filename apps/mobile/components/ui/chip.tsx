import { Text, View } from "react-native";

export type ChipTone = "neutral" | "clay" | "grass" | "hard" | "muted";

const TONES: Record<ChipTone, { bg: string; text: string }> = {
  neutral: { bg: "bg-paper/10", text: "text-paper/80" },
  clay: { bg: "bg-clay/15", text: "text-clay" },
  grass: { bg: "bg-grass/15", text: "text-grass" },
  hard: { bg: "bg-hard/15", text: "text-hard" },
  muted: { bg: "bg-paper/5", text: "text-paper/50" },
};

// Status/label pill (tournament status, join status, phase format, …).
export function Chip({ label, tone = "neutral" }: { label: string; tone?: ChipTone }) {
  const t = TONES[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${t.bg}`}>
      <Text className={`text-xs font-medium ${t.text}`}>{label}</Text>
    </View>
  );
}
