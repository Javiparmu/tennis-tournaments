import type { UserProfileMatchEntry } from "./match";
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
