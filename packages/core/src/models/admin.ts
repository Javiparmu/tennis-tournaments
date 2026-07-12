import type { ClubContactRequest } from "./club";
import type { TournamentStatus } from "./tournament";
import type { PublicUser } from "./user";

export type AdminOverview = {
  totalClubs: number;
  pendingClubContactRequests: number;
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalUsers?: number | null;
  totalPlayers?: number | null;
};

export type AdminClubSummary = {
  id: number;
  name: string;
  phoneNumber: string | null;
  address: string | null;
  owner: PublicUser;
  tournamentCount: number;
  createdAt?: string | null;
};

export type AdminClubContactRequest = ClubContactRequest;

export type AdminTournamentStatusBreakdown = Partial<Record<TournamentStatus, number>>;
