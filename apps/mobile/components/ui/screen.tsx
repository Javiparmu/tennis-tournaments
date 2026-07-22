import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { type Edge, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/tokens";
import { tabBarClearance } from "./tab-bar";

type ScreenProps = {
  children: ReactNode;
  /** Header pinned above the scroll area. It pads the top inset itself, so it is not
      part of the scrolling content. */
  hero?: ReactNode;
  /** Scroll the content (default true). Set false for full-bleed screens. */
  scroll?: boolean;
  /** Safe-area edges to inset. Defaults to top only when there is no hero — a hero
      pads `insets.top` itself, so insetting here too would double-pad it. */
  edges?: Edge[];
  /** Classes for the outer frame. */
  className?: string;
  /** Set on the five (tabs) screens so content clears the floating tab bar. Stack
      screens must leave it off, or they get dead space above the home indicator. */
  tabBar?: boolean;
};

const CONTENT = "px-5 pt-5 gap-4";
const BOTTOM_GAP = 16;

// App frame: canvas safe-area background, optional fixed header, optional scroll.
//
// The bottom padding is a style, not a class: the floating tab bar overlays the
// scroll content, so the clearance has to be computed from the live safe-area inset
// and the bar's real height (see tab-bar.tsx) rather than guessed at in Tailwind.
export function Screen({ children, hero, scroll = true, edges, className, tabBar = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const resolvedEdges: Edge[] = edges ?? (hero ? [] : ["top"]);
  const paddingBottom = tabBar ? tabBarClearance(insets.bottom) + BOTTOM_GAP : 32;

  return (
    <SafeAreaView edges={resolvedEdges} style={{ flex: 1, backgroundColor: colors.canvas }} className={className}>
      {hero}
      {scroll ? (
        <ScrollView
          contentContainerClassName={CONTENT}
          contentContainerStyle={{ paddingBottom }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${CONTENT}`} style={{ paddingBottom }}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
