import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { colors } from "../../theme/tokens";

export type SectionHeaderProps = {
  /** Mono micro-label above the title ("TU TEMPORADA", "FASE", …). */
  eyebrow?: string;
  title: string;
  /** Leading glyph next to the title. Pass the lucide component itself: `icon={Users}`. */
  icon?: LucideIcon;
  /** Trailing action ("Ver todos", a filter, …), right-aligned on the title row. */
  action?: ReactNode;
};

// Section divider inside the scroll content — the in-page counterpart to Hero.
export function SectionHeader({ eyebrow, title, icon: Icon, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1 gap-0.5">
        {eyebrow ? (
          <Text className="font-mono text-[11px] uppercase tracking-[2px] text-ink-faint">{eyebrow}</Text>
        ) : null}
        {/* Icon sits on the title row so it centres with the title line (the second,
            larger line), not the whole eyebrow+title block. */}
        <View className="flex-row items-center gap-2.5">
          {Icon ? <Icon color={colors.inkMuted} size={18} /> : null}
          <Text className="flex-1 font-display text-lg tracking-tight text-ink">{title}</Text>
        </View>
      </View>
      {action}
    </View>
  );
}
