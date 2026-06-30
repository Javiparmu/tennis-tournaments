import type { Match, PhaseFormat } from "./match";

// GET /tournaments/{id}/bracket — matches organised by phase then round.
export type BracketRound = {
  round: number;
  matches: Match[];
};

export type BracketPhase = {
  id: number;
  tournamentId: number;
  phaseOrder: number;
  format: PhaseFormat;
  rounds: BracketRound[];
};

export type TournamentBracket = {
  tournamentId: number;
  phases: BracketPhase[];
};
