import type { MatchStatus, TennisScore } from "../models";

// "6-4  7-6(5)" style score string, or a status fallback when no score recorded.
export function formatScore(score: TennisScore | null, status: MatchStatus): string {
  if (!score || score.sets.length === 0) {
    return status === "WALKOVER" ? "W.O." : "Sin resultado";
  }
  return score.sets
    .map((set) => {
      const tiebreak = set.tiebreak ? `(${set.tiebreak.player1Points}-${set.tiebreak.player2Points})` : "";
      return `${set.player1Games}-${set.player2Games}${tiebreak}`;
    })
    .join("  ");
}
