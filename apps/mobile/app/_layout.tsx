import "../global.css";
import "../lib/core-init";

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { setMutationNotifier } from "@courtrank/core";
// Imported per weight, not from the package roots: each root index re-exports every
// weight and italic, so Metro would bundle all 54 font files (~4 MB) to ship the 10
// we actually use.
import { Archivo_700Bold } from "@expo-google-fonts/archivo/700Bold";
import { Archivo_800ExtraBold } from "@expo-google-fonts/archivo/800ExtraBold";
import { Archivo_900Black } from "@expo-google-fonts/archivo/900Black";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { GeistMono_400Regular } from "@expo-google-fonts/geist-mono/400Regular";
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { GeistMono_700Bold } from "@expo-google-fonts/geist-mono/700Bold";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppLoading, ToastHost } from "../components/ui";
import { notifyMutationError } from "../lib/notify";
import { QueryProvider } from "../lib/query/query-provider";

// Hand the shared core its native danger-toast channel (config is injected by
// core-init above).
setMutationNotifier(notifyMutationError);

// Hold the native splash until fonts and the Clerk session both resolve, so the
// first paint is never an unstyled or wrong-stack flash.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (fast refresh) — nothing to hold.
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const ready = fontsReady && isLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        // Already hidden — nothing to do.
      });
    }
  }, [ready]);

  if (!ready) {
    return <AppLoading />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={Boolean(isSignedIn)}>
        <Stack.Screen name="(tabs)" />
        {/* Admin console is a signed-in-only stack route; the screen itself gates on
            PLATFORM_ADMIN and the backend authorizes every call. */}
        <Stack.Screen name="admin" />
        {/* Host/club-owner surface: any signed-in user reaches /host to manage or
            request a club; /club/[id] gates management on managedClubIds (UI-only) and
            the backend authorizes every mutation. */}
        <Stack.Screen name="host" />
        <Stack.Screen name="club/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  // Each weight is its own family: RN cannot synthesize weights for custom fonts.
  // These keys are the family names the Tailwind `fontFamily` utilities resolve to.
  const [fontsLoaded, fontError] = useFonts({
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_700Bold,
  });

  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  // Fonts are bundled locally, so a failure is not a network stall — fall through
  // to system fonts rather than holding the splash forever.
  const fontsReady = fontsLoaded || fontError !== null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <QueryProvider>
              <RootNavigator fontsReady={fontsReady} />
              <StatusBar style="light" />
            </QueryProvider>
          </ClerkProvider>
        </BottomSheetModalProvider>
        {/* Outside the sheet provider so toasts paint above any open sheet. */}
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
