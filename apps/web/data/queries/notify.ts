"use client";

import { toast } from "@heroui/react";
import { errorMessage } from "@courtrank/core/lib/errors";

// Surface a mutation failure to the user. Optimistic mutations close their modal
// immediately (fire-and-close), so a failure can no longer be shown inline via
// <FormError> — a danger toast is the post-close channel. The QueryClient's
// mutations.onError console.error floor (app/providers.tsx) still logs every
// failure regardless, so nothing is fully silent.
export function notifyMutationError(error: unknown): void {
  toast.danger(errorMessage(error));
}

// Confirm a completed fire-and-close action once its modal has already unmounted
// (e.g. the /admin club provision flow, which closes as soon as the club is
// created). Mirrors notifyMutationError on the success path.
export function notifySuccess(message: string): void {
  toast.success(message);
}
