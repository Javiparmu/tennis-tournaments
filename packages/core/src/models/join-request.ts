import type { Player } from "./player";
import type { PublicUser } from "./user";

export type TournamentJoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";

export type TournamentJoinRequest = {
  id: number;
  tournamentId: number;
  player: Player;
  requester: PublicUser;
  status: TournamentJoinRequestStatus;
  playerNote?: string | null;
  managerNote?: string | null;
  decidedBy?: PublicUser | null;
  requestedAt: string;
  decidedAt?: string | null;
  withdrawnAt?: string | null;
  resubmitAfter?: string | null;
  resubmitUnlockedBy?: PublicUser | null;
  resubmitUnlockedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateTournamentJoinRequest = {
  playerName?: string | null;
  note?: string | null;
};

export type AcceptTournamentJoinRequest = {
  seed?: number | null;
  note?: string | null;
};

export type DecideTournamentJoinRequest = {
  note?: string | null;
};
