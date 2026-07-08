"use client";

import { toast } from "@heroui/react";
import { errorMessage } from "@/lib/errors";

// Surface a mutation failure to the user. Optimistic mutations close their modal
// immediately (fire-and-close), so a failure can no longer be shown inline via
// <FormError> — a danger toast is the post-close channel. The QueryClient's
// mutations.onError console.error floor (app/providers.tsx) still logs every
// failure regardless, so nothing is fully silent.
export function notifyMutationError(error: unknown): void {
  toast.danger(errorMessage(error));
}
