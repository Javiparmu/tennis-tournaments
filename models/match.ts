import type { Player } from "./player";
import type { TennisScore } from "./score";

export type PhaseFormat = "KNOCKOUT" | "GROUP" | "SWISS";
export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "WALKOVER";
export type Outcome = "WINNER" | "LOSER";

export type MatchDependency = {
  requiredMatchId: number;
  requiredOutcome: Outcome;
};

export type Match = {
  id: number;
  phaseId: number;
  round: number;
  groupId: number | null;
  player1: Player | null;
  player2: Player | null;
  winnerId: number | null;
  score: TennisScore | null;
  status: MatchStatus;
  scheduledTime: string | null;
  completedAt: string | null;
  court: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  matchDependencies: MatchDependency[];
};

export type UserMatchResult = "WIN" | "LOSS";

export type UserMatchTournamentSummary = {
  id: number;
  name: string;
};

export type UserMatchPhaseSummary = {
  id: number;
  phaseOrder: number;
  format: PhaseFormat;
  round: number;
};

export type UserMatchOpponentSummary = {
  id: number;
  name: string;
  userId: number | null;
};

export type UserMatchActivityItem = {
  matchId: number;
  completedAt: string;
  status: Extract<MatchStatus, "COMPLETED" | "WALKOVER">;
  result: UserMatchResult;
  score: TennisScore | null;
  court: string | null;
  tournament: UserMatchTournamentSummary;
  phase: UserMatchPhaseSummary;
  opponent: UserMatchOpponentSummary | null;
};

export type UserMatchActivityResponse = {
  userId: number;
  playerId: number | null;
  playerName: string | null;
  from: string;
  to: string;
  matches: UserMatchActivityItem[];
};

export type UserProfileMatchEntry = {
  matchId: number;
  status: MatchStatus;
  result: UserMatchResult | null;
  scheduledTime: string | null;
  completedAt: string | null;
  score: TennisScore | null;
  court: string | null;
  tournament: UserMatchTournamentSummary;
  phase: UserMatchPhaseSummary;
  opponent: UserMatchOpponentSummary | null;
};
