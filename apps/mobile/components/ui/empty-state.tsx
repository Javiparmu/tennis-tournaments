import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { colors } from "../../theme/tokens";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Pass the lucide component itself, not an element: `icon={SearchX}`. */
  icon?: LucideIcon;
}) {
  return (
    <View className="items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface p-8">
      {Icon ? (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-2">
          <Icon color={colors.inkFaint} size={22} />
        </View>
      ) : null}
      <Text className="text-center font-display text-base text-ink">{title}</Text>
      {description ? <Text className="text-center font-sans text-sm text-ink-muted">{description}</Text> : null}
      {action ? <View className="mt-1">{action}</View> : null}
    </View>
  );
}
