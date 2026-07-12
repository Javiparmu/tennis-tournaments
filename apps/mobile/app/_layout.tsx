import "../global.css";
import "../lib/core-init";

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { setMutationNotifier } from "@courtrank/core";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastHost } from "../components/ui";
import { notifyMutationError } from "../lib/notify";
import { QueryProvider } from "../lib/query/query-provider";

// Hand the shared core its native danger-toast channel (config is injected by
// core-init above).
setMutationNotifier(notifyMutationError);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  // Hold the splash (blank) until Clerk resolves, so we never flash the wrong
  // stack. Phase 4 swaps this for a branded splash gate.
  if (!isLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={Boolean(isSignedIn)}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <QueryProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </QueryProvider>
        </ClerkProvider>
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
