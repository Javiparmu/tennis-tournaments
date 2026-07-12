import type { Match } from "@courtrank/core/models";

// Bracket-only helper; the label maps live in the shared @/lib/labels module and
// are re-exported here so existing bracket imports keep working.
export { MATCH_STATUS_LABEL, PHASE_FORMAT_LABEL } from "@courtrank/core/lib/labels";

export function statusColor(status: Match["status"]) {
  if (status === "LIVE" || status === "WALKOVER") return "warning" as const;
  if (status === "COMPLETED") return "success" as const;
  return "default" as const;
}
