export type PublicUser = {
  id: number;
  username: string;
};

export type User = {
  id: number;
  username: string;
  // Projected from our DB (synced from Clerk). Null until the backend supports them.
  name: string | null;
  imageUrl: string | null;
  email: string | null;
  authProvider: string | null;
  authSubject: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  // Only populated on detail reads (/users/me, /users/{id}, /users/by-username), and
  // omitted entirely when the user has none — the backend never encodes the empty
  // default. Read as `user.achievements ?? []`.
  achievements?: Achievement[];
  // Completed/walkover matches won by the user's linked player. Omitted by the
  // backend when 0 (defaults are not serialized).
  matchWins?: number;
  // Elo-style rating (starts at 1000). Optional so an older backend tolerates —
  // callers read `user.rating ?? 1000`.
  rating?: number;
  // Number of rated matches played; drives the provisional badge. Read as `?? 0`.
  ratedMatches?: number;
  // Optional: only present on newer /users/me responses.
  role?: "USER" | "PLATFORM_ADMIN";
  // Clubs the user owns or administers; gates the host UI. Only /users/me fills it in.
  managedClubIds?: number[];
};

export type UpdateUserRequest = {
  name?: string | null;
  // User-chosen handle. Slugified + uniqueness-checked server-side; omit to keep it synced to the name.
  username?: string | null;
  imageUrl?: string | null;
};

export type Achievement = {
  id: number;
  key: string;
  name: string;
  description: string | null;
};
