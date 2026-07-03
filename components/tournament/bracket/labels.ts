import type { BracketPhase, Match } from "@/models";

export function statusColor(status: Match["status"]) {
  if (status === "LIVE" || status === "WALKOVER") return "warning" as const;
  if (status === "COMPLETED") return "success" as const;
  return "default" as const;
}

export const MATCH_STATUS_LABEL: Record<Match["status"], string> = {
  SCHEDULED: "Programado",
  LIVE: "En juego",
  COMPLETED: "Finalizado",
  WALKOVER: "W.O.",
};

export const PHASE_FORMAT_LABEL: Record<BracketPhase["format"], string> = {
  KNOCKOUT: "Eliminatoria",
  GROUP: "Grupos",
  SWISS: "Suizo",
};
