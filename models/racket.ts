export type RacketVisibility = "PUBLIC" | "PRIVATE";

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

export type CreateRacketRequest = {
  displayName: string;
  brand?: string | null;
  model?: string | null;
  stringPattern?: string | null;
  visibility: RacketVisibility;
};

export type UpdateRacketRequest = {
  displayName?: string | null;
  brand?: string | null;
  model?: string | null;
  stringPattern?: string | null;
  visibility?: RacketVisibility;
};

export type CreateRacketStringingRequest = {
  stringingDate: string;
  mainsTensionKg: number;
  crossesTensionKg: number;
  mainStringType?: string | null;
  crossStringType?: string | null;
  performanceNotes?: string | null;
};

export type UpdateRacketStringingRequest = {
  stringingDate?: string;
  mainsTensionKg?: number;
  crossesTensionKg?: number;
  mainStringType?: string | null;
  crossStringType?: string | null;
  performanceNotes?: string | null;
};
