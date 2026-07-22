import type { ReactNode } from "react";
import type { AccessibilityRole, StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type PressableScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  /** Classes for the pressable box itself (background, border, padding, `active:` …). */
  className?: string;
  /** Inline styles for the pressable box — shadows and other class-less props. */
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
};

const SPRING = { damping: 18, stiffness: 260, mass: 0.5 };

// Press feedback for cards and buttons: a small scale/opacity dip on press-in that
// springs back on release.
//
// The animation lives on a wrapper rather than on the Pressable because NativeWind
// registers no interop for Reanimated components — `className` on an `Animated.*`
// is dropped, and handing an interop'd component both a `className` and a
// `useAnimatedStyle` result would push that result through the class pipeline and
// flatten Reanimated's internals into style declarations. So: the wrapper animates
// via `style` only, and the Pressable inside carries every class. The wrapper is
// layout-neutral (it stretches to its parent and wraps its child's height).
export function PressableScale({
  children,
  onPress,
  className,
  style,
  disabled,
  accessibilityRole,
  accessibilityLabel,
}: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value === 1 ? 0.97 : 1, SPRING) }],
    opacity: withSpring(pressed.value === 1 ? 0.9 : 1, SPRING),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
        disabled={disabled}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        className={className}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
