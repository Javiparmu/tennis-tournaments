import type { TennisScore } from "./score";

export type League = {
  id: number;
  name: string;
  description: string | null;
  ownerUserId: number;
  inviteCode: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type LeagueMember = {
  leagueId: number;
  playerId: number;
  userId: number;
  name: string;
  username: string;
  rating: number;
  ratedMatches: number;
  wins: number;
  losses: number;
  joinedAt: string | null;
};

export type LeagueMatch = {
  id: number;
  leagueId: number;
  player1Id: number;
  player2Id: number;
  winnerId: number;
  score: TennisScore | null;
  playedAt: string;
  createdByUserId: number;
  createdAt: string | null;
};

export type CreateLeagueRequest = {
  name: string;
  description?: string | null;
};

export type UpdateLeagueRequest = {
  id: number;
  name?: string | null;
  description?: string | null;
};

export type JoinLeagueRequest = {
  inviteCode: string;
};

export type AddLeagueMemberRequest = {
  email: string;
};

export type RecordLeagueMatchRequest = {
  player1Id: number;
  player2Id: number;
  winnerId: number;
  score?: TennisScore | null;
  playedAt?: string | null;
};
