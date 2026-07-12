import type { MatchStatus, PhaseFormat, RatingReason, TournamentJoinRequestStatus, TournamentStatus } from "../models";

// Canonical Spanish label maps. Keep user-visible copy here so it stays
// consistent across views; intentional per-context divergences are called out
// explicitly rather than silently forked.

// Tournament status — management/detail copy (host dashboards, club and
// tournament detail views).
export const TOURNAMENT_STATUS_LABEL: Record<TournamentStatus, string> = {
  DRAFT: "Borrador",
  STARTED: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  ABANDONED: "Abandonado",
};

// Public listing copy. Intentional divergence from the management map: an
// unpublished (DRAFT) tournament reads as "Próximamente" for players, and
// ABANDONED collapses to "Cancelado". The public tournaments listing uses this.
export const TOURNAMENT_STATUS_LABEL_PUBLIC: Record<TournamentStatus, string> = {
  ...TOURNAMENT_STATUS_LABEL,
  DRAFT: "Próximamente",
  ABANDONED: "Cancelado",
};

export const PHASE_FORMAT_LABEL: Record<PhaseFormat, string> = {
  KNOCKOUT: "Eliminatoria",
  GROUP: "Grupos",
  SWISS: "Suizo",
};

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  SCHEDULED: "Programado",
  LIVE: "En juego",
  COMPLETED: "Finalizado",
  WALKOVER: "W.O.",
};

// Reason a rating event happened — shown in the progression chart's tooltip.
// Keyed by RatingReason but declared as a wide record so an unknown backend
// reason can fall back gracefully at the call site.
export const RATING_REASON_LABEL: Record<RatingReason, string> = {
  MATCH: "Partido",
  GUEST_WIN: "Victoria (invitado)",
  GUEST_LOSS: "Derrota (invitado)",
  TOURNAMENT_BONUS: "Bonus de torneo",
  DECAY: "Inactividad",
};

export const RESULT_LABEL: Record<string, string> = {
  WIN: "Victoria",
  LOSS: "Derrota",
};

export const VISIBILITY_LABEL: Record<string, string> = {
  PUBLIC: "Pública",
  PRIVATE: "Privada",
};

// Short chip labels for a viewer's tournament registration status.
// NOTE: JoinTournament renders longer banner-style copy ("Solicitud pendiente",
// "¡Estás dentro!", ...); that divergent map stays local to that component.
export const JOIN_STATUS_LABEL: Record<TournamentJoinRequestStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  WITHDRAWN: "Retirada",
  EXPIRED: "Caducada",
};
