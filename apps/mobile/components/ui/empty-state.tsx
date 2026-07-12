import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-paper/10 bg-paper/5 p-8">
      <Text className="text-center text-base font-semibold text-paper">{title}</Text>
      {description ? <Text className="text-center text-sm text-paper/60">{description}</Text> : null}
      {action ? <View className="mt-2">{action}</View> : null}
    </View>
  );
}
