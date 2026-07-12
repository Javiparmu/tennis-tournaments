import { View } from "react-native";

// Space-reserving placeholder. Keep the same footprint as the real content so
// screens don't shift when data resolves (same rule as web).
export function Skeleton({ className }: { className?: string }) {
  return <View className={`rounded-xl bg-paper/10 ${className ?? "h-4 w-full"}`} />;
}
