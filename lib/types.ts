export type ApiStatus = "SUCCESS" | "FAILURE";

export type ApiResponse<T> = {
  status: ApiStatus;
  data: T | null;
  message: string | null;
};

export type SurfaceType = "CLAY" | "HARD" | "GRASS";
export type PhaseFormat = "KNOCKOUT" | "GROUP" | "SWISS";
export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "WALKOVER";
export type Outcome = "WINNER" | "LOSER";

export type PublicUser = {
  id: number;
  username: string;
};

export type User = {
  id: number;
  username: string;
  email: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Player = {
  id: number;
  name: string;
  external: boolean;
  user: PublicUser | null;
};

export type Club = {
  id: number;
  name: string;
  phoneNumber: string | null;
  address: string | null;
  user: PublicUser;
};

export type TiebreakScore = {
  player1Points: number;
  player2Points: number;
};

export type SetScore = {
  player1Games: number;
  player2Games: number;
  tiebreak: TiebreakScore | null;
};

export type TennisScore = {
  sets: SetScore[];
};

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
  court: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  matchDependencies: MatchDependency[];
};

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

export type PlayerProfileView = {
  displayName: string;
  elo: number;
  points: number;
  achievements: string[];
  bio: string;
  favoriteSurface: SurfaceType | null;
};
