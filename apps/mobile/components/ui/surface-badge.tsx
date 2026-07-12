import { SURFACE_FALLBACK, SURFACE_HEX, SURFACE_LABEL, type SurfaceType } from "@courtrank/core";
import { Text, View } from "react-native";

// Surface chip (clay/hard/grass) — label + accent dot from the shared core data.
export function SurfaceBadge({ surface }: { surface?: string | null }) {
  const key = surface ? (surface.toUpperCase() as SurfaceType) : undefined;
  const label = key && SURFACE_LABEL[key] ? SURFACE_LABEL[key] : SURFACE_FALLBACK.label;
  const hex = key && SURFACE_HEX[key] ? SURFACE_HEX[key] : SURFACE_FALLBACK.hex;
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full border border-paper/10 px-2.5 py-1">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hex }} />
      <Text className="text-xs font-medium text-paper/80">{label}</Text>
    </View>
  );
}
