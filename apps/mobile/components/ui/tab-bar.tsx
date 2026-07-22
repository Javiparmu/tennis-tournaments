import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/tokens";

// Derived from expo-router's own `tabBar` slot rather than imported from
// `@react-navigation/bottom-tabs`: that package is expo-router's dependency, not
// ours, and importing it directly would be a phantom dependency — resolvable today
// only because pnpm happens to hoist it, and a bundler error the day it doesn't.
// Taking the type off the prop we implement keeps it correct with no new import.
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

// The bar's own geometry. Anything that has to sit clear of it (Screen's scroll
// padding, the toast stack) derives its offset from these rather than hardcoding a
// number — a floating bar overlays content, so a drifted constant means either dead
// space or a button you cannot reach.
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_MARGIN = 8;

/** Distance from the bottom of the safe area to the top of the floating bar. */
export function tabBarClearance(bottomInset: number): number {
  return bottomInset + TAB_BAR_HEIGHT + TAB_BAR_MARGIN;
}

const ICON_SIZE = 22;

// Floating pill navigation. Icon-only: at five tabs there is no width for labels
// that would still be legible, so each target carries its Spanish name as its
// accessibility label instead — the label is not decoration we can drop, it is the
// only name a screen reader has.
export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    // `box-none` so the gaps either side of the bar pass touches through to the
    // content scrolling underneath it.
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 0, right: 0, bottom: insets.bottom + TAB_BAR_MARGIN }}
      className="px-5"
    >
      <View
        className="flex-row items-center justify-around rounded-full border border-line bg-surface-2 px-2"
        style={{ height: TAB_BAR_HEIGHT }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = typeof options.title === "string" ? options.title : route.name;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              className={`h-12 w-12 items-center justify-center rounded-full ${
                focused ? "bg-lime" : "active:bg-surface"
              }`}
            >
              {options.tabBarIcon?.({
                focused,
                color: focused ? colors.canvas : colors.inkMuted,
                size: ICON_SIZE,
              })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
