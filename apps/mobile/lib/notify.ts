import { errorMessage } from "@courtrank/core";
import { Alert } from "react-native";

// The danger channel for fire-and-close mutation failures (wired into the core
// optimistic factory via setMutationNotifier). A native Alert for now; Phase 4
// replaces it with an in-app Toast.
export function notifyMutationError(error: unknown): void {
  Alert.alert("Error", errorMessage(error));
}

export function notifySuccess(message: string): void {
  Alert.alert("Listo", message);
}
