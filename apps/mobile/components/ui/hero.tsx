import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, heroGradient } from "../../theme/tokens";

// Dark gradient header, mirroring the web PageHero chrome.
export function Hero({
  title,
  subtitle,
  right,
  children,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={heroGradient} style={{ paddingTop: insets.top + 12 }}>
      <View className="gap-3 px-5 pb-5">
        {onBack ? (
          <Pressable onPress={onBack} className="-ml-1 mb-1 h-8 w-8 items-center justify-center rounded-full active:opacity-70">
            <ChevronLeft color={colors.paper} size={24} />
          </Pressable>
        ) : null}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-2xl font-bold text-paper">{title}</Text>
            {subtitle ? <Text className="text-sm text-paper/60">{subtitle}</Text> : null}
          </View>
          {right}
        </View>
        {children}
      </View>
    </LinearGradient>
  );
}
