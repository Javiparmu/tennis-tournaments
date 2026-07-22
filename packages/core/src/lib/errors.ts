import { ApiError } from "../api/client";
import { type ApiErrorOperation, resolveApiErrorCopy } from "./error-copy";

// Shared, user-facing error message extractor. Always returns a string so
// callers can render it directly; gate rendering on the query/mutation's
// error state (isError / error != null), not on the message being truthy.
//
// Pass the `operation` the UI was attempting to get copy tailored to that flow
// (for example `errorMessage(createTournament.error, "tournament.create")`).
// Copy is resolved from the backend's HTTP status, never its English message,
// so backend rewording never breaks the UI and a new backend error still shows
// a sensible Spanish message.
export function errorMessage(error: unknown, operation?: ApiErrorOperation): string {
  if (error instanceof ApiError) {
    // A resolved string means a backend error (it carried an HTTP status). Null
    // means a client-side ApiError (timeout, unexpected response) whose own
    // message is already Spanish.
    return resolveApiErrorCopy(error.status, operation) ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ha ocurrido un error inesperado.";
}
