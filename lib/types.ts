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
  authProvider: string | null;
  authSubject: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  achievements: Achievement[];
};

export type Achievement = {
  id: number;
  key: string;
  name: string;
  description: string | null;
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
  completedAt: string | null;
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

export type ProfileCalendarDay = {
  date: string;
  totalCount: number;
  scheduledMatchCount: number;
  liveMatchCount: number;
  completedMatchCount: number;
  walkoverMatchCount: number;
  trainingCount: number;
};

export type ProfileCalendarEvent = {
  eventId: string;
  eventType: "MATCH" | "TRAINING";
  date: string;
  sortTime: string | null;
  match: UserProfileMatchEntry | null;
  training: UserTrainingEntry | null;
};

export type ProfileCalendarResponse = {
  userId: number;
  from: string;
  to: string;
  calendarDays: ProfileCalendarDay[];
  events: ProfileCalendarEvent[];
};

export type RacketVisibility = "PUBLIC" | "PRIVATE";

export type TrainingVisibility = "PUBLIC" | "PRIVATE";

export type UserTrainingEntry = {
  id: number;
  trainingDate: string;
  durationMinutes: number | null;
  notes: string | null;
  visibility: TrainingVisibility;
  createdAt: string;
  updatedAt: string | null;
};

export type UserTrainingCalendarDay = {
  date: string;
  trainingCount: number;
};

export type UserTrainingRangeResponse = {
  userId: number;
  from: string;
  to: string;
  calendarDays: UserTrainingCalendarDay[];
  trainings: UserTrainingEntry[];
};

export type CreateTrainingRequest = {
  trainingDate: string;
  durationMinutes?: number | null;
  notes?: string | null;
  visibility: TrainingVisibility;
};

export type UpdateTrainingRequest = {
  trainingDate?: string;
  durationMinutes?: number | null;
  notes?: string | null;
  visibility?: TrainingVisibility;
};

export type RacketStringingHistoryEntry = {
  id: number;
  stringingDate: string;
  mainsTensionKg: number;
  crossesTensionKg: number;
  mainStringType: string | null;
  crossStringType: string | null;
  performanceNotes: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type RacketSummary = {
  id: number;
  displayName: string;
  brand: string | null;
  model: string | null;
  stringPattern: string | null;
  visibility: RacketVisibility;
  latestStringing: RacketStringingHistoryEntry | null;
  createdAt: string;
  updatedAt: string | null;
};

export type RacketDetails = {
  id: number;
  displayName: string;
  brand: string | null;
  model: string | null;
  stringPattern: string | null;
  visibility: RacketVisibility;
  latestStringing: RacketStringingHistoryEntry | null;
  history: RacketStringingHistoryEntry[];
  createdAt: string;
  updatedAt: string | null;
};
