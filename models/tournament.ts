import type { Match, PhaseFormat } from "./match";
import type { Player } from "./player";

export type SurfaceType = "CLAY" | "HARD" | "GRASS";

export type KnockoutConfig = {
  thirdPlacePlayoff: boolean;
};

export type GroupConfig = {
  groupCount: number;
  teamsPerGroup: number;
  advancingPerGroup: number;
};

export type SwissConfig = {
  pointsPerWin: number;
};

export type PhaseConfiguration =
  | { type: "knockout"; value: KnockoutConfig }
  | { type: "group"; value: GroupConfig }
  | { type: "swiss"; value: SwissConfig };

export type TournamentPhase = {
  id: number;
  tournamentId: number;
  phaseOrder: number;
  format: PhaseFormat;
  rounds: number;
  configuration: PhaseConfiguration;
  createdAt: string;
  updatedAt: string | null;
  matches: Match[];
};

export type Tournament = {
  id: number;
  name: string;
  description: string | null;
  surface: SurfaceType | null;
  clubId: number;
  startDate: string;
  endDate: string;
  createdAt: string | null;
  updatedAt: string | null;
  players: Player[];
  phases: TournamentPhase[];
};
