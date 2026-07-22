import type { Match, TennisScore } from "../models";

export type ScoreWinnerSide = 1 | 2;

export type MatchResultEditBlockReason = "missing-player" | "next-match-played";

export type MatchResultEditState = {
  canEdit: boolean;
  reason: MatchResultEditBlockReason | null;
  blockingMatchId: number | null;
};

export function inferScoreWinnerSide(score: TennisScore): ScoreWinnerSide | null {
  let player1Sets = 0;
  let player2Sets = 0;

  for (const set of score.sets) {
    if (set.player1Games === set.player2Games) return null;
    if (set.player1Games > set.player2Games) player1Sets += 1;
    else player2Sets += 1;
  }

  if (player1Sets === player2Sets) return null;
  return player1Sets > player2Sets ? 1 : 2;
}

export function inferScoreWinnerId(match: Match, score: TennisScore): number | null {
  const side = inferScoreWinnerSide(score);
  if (side === 1) return match.player1?.id ?? null;
  if (side === 2) return match.player2?.id ?? null;
  return null;
}

export function getMatchResultEditState(match: Match, allMatches: Match[]): MatchResultEditState {
  if (match.player1 == null || match.player2 == null) {
    return { canEdit: false, reason: "missing-player", blockingMatchId: null };
  }

  const blockingMatch = allMatches.find(
    (candidate) =>
      candidate.matchDependencies.some((dependency) => dependency.requiredMatchId === match.id) &&
      (candidate.status === "LIVE" ||
        candidate.status === "COMPLETED" ||
        candidate.status === "WALKOVER" ||
        candidate.winnerId != null),
  );

  if (blockingMatch) {
    return { canEdit: false, reason: "next-match-played", blockingMatchId: blockingMatch.id };
  }

  return { canEdit: true, reason: null, blockingMatchId: null };
}
