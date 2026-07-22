import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { colors } from "../../theme/tokens";

// Segmented control for in-page tabs (profile: Resumen / Raquetas / Entrenos).
// Fully-round track and thumb: the same pill language as the bottom tab bar and the
// status chips, so "pick one of these" looks the same everywhere in the app.
//
// `icon` is optional but all-or-nothing per strip: a half-iconed row reads as a
// glitch, so either every tab carries one or none do.
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ key: T; label: string; icon?: LucideIcon }>;
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View className="flex-row rounded-full border border-line bg-surface-2 p-1">
      {tabs.map((tab) => {
        const active = tab.key === value;
        const Icon = tab.icon;
        // Icon colour can't ride the className text colour — lucide reads a hex prop.
        const iconColor = active ? colors.canvas : colors.inkMuted;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            className={`min-h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5 ${
              active ? "bg-lime" : "active:bg-surface"
            }`}
          >
            {Icon ? <Icon color={iconColor} size={16} /> : null}
            <Text className={`text-sm ${active ? "font-sans-semibold text-canvas" : "font-sans-medium text-ink-muted"}`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
