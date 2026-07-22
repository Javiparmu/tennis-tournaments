import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/tokens";
import { Floodlight } from "./ui/floodlight";

const logoMark = require("../assets/logo-mark.png");
const nightStadium = require("../assets/night-stadium.webp");

// The photo is only ever a texture: the scrim has to hold the whole frame down to
// near-canvas so body copy and lime accents keep their contrast no matter which part
// of the stadium lands behind them.
const SCRIM = ["rgba(11,15,12,0.72)", "rgba(11,15,12,0.96)"] as const;

type AuthScreenProps = {
  children: ReactNode;
  /** Line under the wordmark. */
  subtitle?: string;
};

// The auth frame. This replaces the old NightScreen, which existed as "the dark
// counterpart to a light Screen" — a distinction the dark-first app no longer has.
// What survived the merge is the part that was never about theme: the stadium
// backdrop, the brand lockup, and the keyboard behaviour, which are specific to the
// two auth screens and belong nowhere near the tab-app frame. Keeping the scrim here
// (rather than per screen) is also what stops the two from drifting apart on contrast.
export function AuthScreen({ children, subtitle }: AuthScreenProps) {
  return (
    <View className="flex-1 bg-canvas">
      {/* Neither expo-image nor LinearGradient has a NativeWind interop — both are
          positioned through `style`. */}
      <Image source={nightStadium} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient colors={SCRIM} style={StyleSheet.absoluteFill} />
      <Floodlight />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerClassName="flex-grow justify-center gap-5 px-6 py-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center gap-3">
              {/* logo-mark.png is a monochrome-alpha mark, so it tints cleanly. */}
              <Image source={logoMark} tintColor={colors.lime} contentFit="contain" style={{ height: 40, width: 40 }} />
              <Text className="font-display-black text-4xl tracking-tight text-ink">
                Court<Text className="text-lime">Rank</Text>
              </Text>
              {subtitle ? <Text className="text-center font-sans text-base text-ink-muted">{subtitle}</Text> : null}
            </View>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
