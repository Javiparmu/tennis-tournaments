import { errorMessage } from "@courtrank/core";
import { showToast } from "../components/ui/toast";

// The danger/success channels wired into the core optimistic factory via
// setMutationNotifier, and used by fire-and-close flows once their sheet closes.
export function notifyMutationError(error: unknown): void {
  showToast("danger", errorMessage(error));
}

export function notifySuccess(message: string): void {
  showToast("success", message);
}
