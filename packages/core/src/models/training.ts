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
