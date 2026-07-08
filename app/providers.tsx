"use client";

import { Toast } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            // Last-resort log so a mutation failure is never fully silent, even
            // when a call site forgets to surface the error.
            onError: (error) => console.error(error),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Imperative toast queue (lives outside React) — fired from mutation onError
          via notifyMutationError so optimistic fire-and-close flows can still
          surface failures after their modal has closed. */}
      <Toast.Provider placement="bottom end" />
    </QueryClientProvider>
  );
}
