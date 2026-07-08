// Append-only rating-change events powering the public rating-history endpoint
// (`GET /users/{id}/rating-history`). One row per change to a player's Elo-style
// rating. `matchId` / `tournamentId` are populated by `reason`:
//   MATCH / GUEST_WIN / GUEST_LOSS -> match + tournament
//   TOURNAMENT_BONUS               -> tournament only
//   DECAY                          -> neither
export type RatingReason = "MATCH" | "GUEST_WIN" | "GUEST_LOSS" | "TOURNAMENT_BONUS" | "DECAY";

export type RatingEvent = {
  id: number;
  matchId: number | null;
  tournamentId: number | null;
  // Kept as a wide string (not the union) so a newer backend reason doesn't break
  // deserialization; the label map falls back for unknown reasons.
  reason: string;
  delta: number;
  ratingAfter: number;
  createdAt: string;
};
