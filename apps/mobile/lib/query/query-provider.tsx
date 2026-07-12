import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

// Mirrors the web QueryClient defaults (retry 1, staleTime 30s, console.error
// floor) and bridges React Native AppState → focusManager so refetch-on-focus
// works on native.
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
          mutations: { onError: (error) => console.error(error) },
        },
      }),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
      if (Platform.OS !== "web") {
        focusManager.setFocused(status === "active");
      }
    });
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
