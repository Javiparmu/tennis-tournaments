import type { TournamentJoinRequestStatus } from "./join-request";
import type { UserProfileMatchEntry } from "./match";
import type { SurfaceType, TournamentStatus } from "./tournament";
import type { UserTrainingEntry } from "./training";

export type ProfileCalendarDay = {
  date: string;
  totalCount: number;
  scheduledMatchCount: number;
  liveMatchCount: number;
  completedMatchCount: number;
  walkoverMatchCount: number;
  trainingCount: number;
};

export type ProfileCalendarTournamentEntry = {
  id: number;
  name: string;
  status: TournamentJoinRequestStatus; // the viewer's registration status
  tournamentStatus: TournamentStatus;
  startDate: string;
  endDate: string;
  surface: SurfaceType | null;
};

export type ProfileCalendarEvent = {
  eventId: string;
  eventType: "MATCH" | "TRAINING" | "TOURNAMENT";
  date: string;
  sortTime: string | null;
  match: UserProfileMatchEntry | null;
  training: UserTrainingEntry | null;
  // Present only on synthetic TOURNAMENT events (registrations merged in client-side).
  tournament: ProfileCalendarTournamentEntry | null;
};

export type ProfileCalendarResponse = {
  userId: number;
  from: string;
  to: string;
  calendarDays: ProfileCalendarDay[];
  events: ProfileCalendarEvent[];
};
