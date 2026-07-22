import { Image } from "expo-image";
import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "../../theme/tokens";

const logoMark = require("../../assets/logo-mark.png");

// Branded hand-off between the native splash and the first screen: the app holds
// here while fonts and the Clerk session resolve, so nothing ever flashes. The
// background must be the canvas, not a gradient — this paints immediately before
// the first real screen, and any other colour here is a visible flash.
export function AppLoading() {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-canvas">
      <View className="items-center gap-4">
        {/* logo-mark.png is a monochrome-alpha mark, so it tints cleanly. */}
        <Image source={logoMark} tintColor={colors.lime} contentFit="contain" style={{ height: 72, width: 72 }} />
        <Text className="font-display-black text-3xl tracking-tight text-ink">
          Court<Text className="text-lime">Rank</Text>
        </Text>
      </View>
      <ActivityIndicator color={colors.lime} />
    </View>
  );
}
