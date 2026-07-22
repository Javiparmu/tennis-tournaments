// User-facing error copy, resolved from the HTTP status the backend returns and
// the operation the UI was attempting — NOT from the backend's English message.
//
// The backend's message text is for its own debug logs; the UI never shows it.
// This keeps copy stable when the backend rewords an error, and means a new
// backend error needs no frontend change: it still resolves to a sensible
// Spanish message by status. Add an entry here only when a specific
// operation+status deserves copy more precise than the status default.

// Statuses the backend actually produces (see its routing error mapper). Any
// other status buckets down to the nearest generic message below.
type StatusKey = 400 | 401 | 403 | 404 | 409 | 422 | 500;

// An operation the UI attempts, as `<entity>.<action>`. Pass one to
// `errorMessage` to get copy tailored to that flow; omit it for the plain
// status-based message.
export type ApiErrorOperation =
  | "tournament.create"
  | "tournament.update"
  | "tournament.start"
  | "tournament.reset"
  | "tournament.fetch"
  | "tournament.joinByCode"
  | "league.create"
  | "league.update"
  | "league.delete"
  | "league.join"
  | "league.addMember"
  | "league.removeMember"
  | "league.recordResult"
  | "league.deleteResult"
  | "phase.create"
  | "tournament.addPlayers"
  | "match.score"
  | "joinRequest.create"
  | "joinRequest.withdraw"
  | "joinRequest.accept"
  | "joinRequest.reject"
  | "player.create"
  | "player.update"
  | "player.delete"
  | "player.fetch"
  | "user.update"
  | "training.save"
  | "training.delete"
  | "racket.save"
  | "racket.delete"
  | "stringing.save"
  | "stringing.delete"
  | "club.create"
  | "club.update"
  | "clubContact.create";

// Generic Spanish copy by status — the fallback whenever an operation has no
// more specific entry. Never leaks the backend's English message.
const STATUS_COPY: Record<StatusKey, string> = {
  400: "Revisa los datos e inténtalo de nuevo.",
  401: "Necesitas iniciar sesión para continuar.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No se ha encontrado lo que buscabas.",
  409: "La acción no se puede completar en este momento.",
  422: "Revisa los datos e inténtalo de nuevo.",
  500: "Ha ocurrido un error en el servidor. Inténtalo de nuevo.",
};

// Per-operation overrides. Only the status codes that warrant copy more precise
// than STATUS_COPY need an entry; everything else falls through to the default.
const OPERATION_COPY: Partial<Record<ApiErrorOperation, Partial<Record<StatusKey, string>>>> = {
  "tournament.create": {
    409: "Ya existe un torneo con ese nombre.",
  },
  "tournament.update": {
    403: "No tienes permiso para editar este torneo.",
    409: "Ya existe un torneo con ese nombre.",
  },
  "tournament.start": {
    409: "El torneo no se puede iniciar en su estado actual.",
    422: "El torneo necesita al menos 2 jugadores y una fase inicial.",
  },
  "tournament.reset": {
    409: "El torneo solo se puede reiniciar cuando está en curso.",
  },
  "tournament.fetch": {
    404: "No existe ningún torneo con esos datos.",
  },
  "tournament.joinByCode": {
    404: "Ese código de invitación no es válido.",
    409: "Ya estás inscrito en ese torneo.",
  },
  "league.create": {
    409: "Ya existe una liga con ese nombre.",
  },
  "league.update": {
    403: "No tienes permiso para editar esta liga.",
    409: "Ya existe una liga con ese nombre.",
  },
  "league.delete": {
    403: "Solo el propietario puede eliminar esta liga.",
  },
  "league.join": {
    404: "Ese código de invitación no es válido.",
    409: "Ya formas parte de esta liga.",
  },
  "league.addMember": {
    404: "No existe ningún usuario con ese correo.",
    409: "Ese jugador ya forma parte de la liga.",
  },
  "league.removeMember": {
    403: "Solo el propietario puede quitar miembros.",
    409: "No se puede quitar a un miembro con partidos registrados.",
  },
  "league.recordResult": {
    403: "Solo los participantes o el propietario pueden registrar este resultado.",
    409: "Ese resultado no se puede registrar.",
    422: "El marcador debe dejar un ganador claro.",
  },
  "league.deleteResult": {
    403: "Solo el propietario puede eliminar resultados.",
  },
  "phase.create": {
    409: "Ya existe una fase con ese orden en el torneo.",
  },
  "tournament.addPlayers": {
    404: "No existe ningún usuario con ese correo.",
    409: "Alguno de los jugadores ya está inscrito en el torneo.",
  },
  "match.score": {
    409: "Este partido no se puede puntuar en su estado actual.",
    422: "El marcador debe dejar un ganador claro.",
  },
  "joinRequest.create": {
    409: "Ya tienes una solicitud para este torneo.",
  },
  "joinRequest.withdraw": {
    409: "Solo puedes retirar solicitudes pendientes.",
  },
  "joinRequest.accept": {
    409: "Solo puedes aceptar solicitudes pendientes.",
  },
  "joinRequest.reject": {
    409: "Solo puedes rechazar solicitudes pendientes.",
  },
  "player.create": {
    409: "Ya tienes un perfil de jugador.",
  },
  "player.update": {
    403: "Solo puedes editar tu propio perfil.",
  },
  "player.delete": {
    403: "Solo puedes eliminar tu propio perfil.",
  },
  "player.fetch": {
    404: "No existe ningún jugador con ese nombre de usuario.",
  },
  "user.update": {
    409: "Ese nombre de usuario ya está en uso.",
  },
  "club.create": {
    409: "Ya existe un club con esos datos.",
  },
  "clubContact.create": {
    409: "Ya has enviado una solicitud de contacto.",
  },
};

// Buckets any HTTP status onto the nearest key that has copy.
function statusKey(status: number): StatusKey {
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409 || status === 422) {
    return status;
  }
  if (status >= 500) return 500;
  return 400;
}

// Resolve Spanish copy for a backend error from its status and (optionally) the
// operation that triggered it. Returns null when there is no status, which marks
// a client-side ApiError (timeout, unexpected response) whose own message is
// already Spanish and should be shown unchanged.
export function resolveApiErrorCopy(status: number | undefined, operation?: ApiErrorOperation): string | null {
  if (status == null) return null;
  const key = statusKey(status);
  if (operation) {
    const override = OPERATION_COPY[operation]?.[key];
    if (override) return override;
  }
  return STATUS_COPY[key];
}
