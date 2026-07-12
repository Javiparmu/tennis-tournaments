import type { ReactNode } from "react";
import { type ColorValue, ScrollView, View } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/tokens";

type ScreenProps = {
  children: ReactNode;
  /** Scroll the content (default true). Set false for full-bleed screens. */
  scroll?: boolean;
  /** Safe-area edges to inset. Default top+bottom (tabs handle their own bottom). */
  edges?: Edge[];
  background?: ColorValue;
  className?: string;
};

// App frame: dark safe-area background with optional scroll. Mirrors PageScaffold's
// role on web.
export function Screen({ children, scroll = true, edges = ["top"], background = colors.ink, className }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: background }}>
      {scroll ? (
        <ScrollView
          className={className}
          contentContainerClassName="px-5 py-4 gap-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={className ?? "flex-1 px-5 py-4"}>{children}</View>
      )}
    </SafeAreaView>
  );
}
