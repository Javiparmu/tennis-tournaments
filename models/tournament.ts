import type { Match, PhaseFormat } from "./match";
import type { Player } from "./player";

export type SurfaceType = "CLAY" | "HARD" | "GRASS";

export type TournamentStatus = "DRAFT" | "STARTED" | "COMPLETED" | "CANCELLED" | "ABANDONED";

export type SeedingStrategy = "INPUT_ORDER" | "RANDOM" | "PARTIAL_SEEDED";

// Polymorphic phase configuration. Backend (kotlinx.serialization, default class
// discriminator) emits a flat object with a "type" key.
export type KnockoutConfig = {
  type: "knockout";
  thirdPlacePlayoff: boolean;
  qualifiers: number;
  seedingStrategy: SeedingStrategy;
};

export type GroupConfig = {
  type: "group";
  groupCount: number;
  teamsPerGroup: number;
  advancingPerGroup: number;
};

export type SwissConfig = {
  type: "swiss";
  pointsPerWin: number;
  advancingCount: number | null;
};

export type PhaseConfiguration = KnockoutConfig | GroupConfig | SwissConfig;

// Phase without its matches (list/summary endpoints).
export type TournamentPhaseSummary = {
  id: number;
  tournamentId: number;
  phaseOrder: number;
  format: PhaseFormat;
  rounds: number;
  configuration: PhaseConfiguration;
  createdAt: string;
  updatedAt: string | null;
};

export type TournamentPhase = TournamentPhaseSummary & {
  matches: Match[];
};

// GET /tournaments — list shape, without players/phases.
export type TournamentBasic = {
  id: number;
  name: string;
  description: string | null;
  surface: SurfaceType | null;
  status: TournamentStatus;
  clubId: number;
  championPlayerId: number | null;
  startDate: string;
  endDate: string;
  createdAt: string | null;
  updatedAt: string | null;
};

// GET /tournaments/{id} — full shape, with players and phases.
export type Tournament = TournamentBasic & {
  players: Player[];
  phases: TournamentPhase[];
};

export type CreateTournamentRequest = {
  name: string;
  description?: string | null;
  surface?: SurfaceType | null;
  clubId: number;
  startDate: string;
  endDate: string;
};

export type UpdateTournamentRequest = {
  id: number;
  name?: string | null;
  description?: string | null;
  surface?: SurfaceType | null;
  clubId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type CreatePhaseRequest = {
  phaseOrder: number;
  format: PhaseFormat;
  configuration: PhaseConfiguration;
};

export type AddPlayerInput = {
  playerId?: number | null;
  name?: string | null;
  seed?: number | null;
};

export type AddPlayersRequest = {
  players: AddPlayerInput[];
};
