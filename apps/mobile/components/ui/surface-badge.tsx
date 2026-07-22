import { SURFACE_FALLBACK, SURFACE_LABEL, type SurfaceType } from "@courtrank/core";
import { Text, View } from "react-native";
import { surfaceColor } from "../../theme/tokens";

// Surface chip (clay/hard/grass) — label from the shared core data, dot from the
// mobile dark-canvas lift. The raw core SURFACE_HEX is tuned for white backgrounds
// and goes muddy here; see `surfaceOnDark` in theme/tokens.
export function SurfaceBadge({ surface }: { surface?: string | null }) {
  const key = surface ? (surface.toUpperCase() as SurfaceType) : undefined;
  const label = key && SURFACE_LABEL[key] ? SURFACE_LABEL[key] : SURFACE_FALLBACK.label;

  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full border border-line bg-surface-2 px-2.5 py-1">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: surfaceColor(surface) }} />
      <Text className="font-sans-medium text-xs text-ink-muted">{label}</Text>
    </View>
  );
}
