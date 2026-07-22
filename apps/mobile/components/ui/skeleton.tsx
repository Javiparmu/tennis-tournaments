import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors } from "../../theme/tokens";

type SkeletonProps = {
  /** Footprint classes. Must match the real content's height so nothing shifts. */
  className?: string;
};

// Space-reserving placeholder. Keep the same footprint as the real content so
// screens don't shift when data resolves (same rule as web).
//
// The outer View owns the footprint classes and clips the radius; the inner
// Animated.View just pulses inside it — NativeWind has no interop for Reanimated
// components, so the fill has to arrive through `style`, not a class.
export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className={`overflow-hidden rounded-xl ${className ?? "h-4 w-full"}`}>
      <Animated.View style={[{ flex: 1, backgroundColor: colors.surface2 }, animatedStyle]} />
    </View>
  );
}
