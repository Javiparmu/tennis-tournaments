import { ApiError } from "@/data/api/client";

// Shared, user-facing error message extractor. Always returns a string so
// callers can render it directly; gate rendering on the query/mutation's
// error state (isError / error != null), not on the message being truthy.
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ha ocurrido un error inesperado.";
}
