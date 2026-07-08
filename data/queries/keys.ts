// Broad prefix roots for invalidation. Each matches every key that starts with
// the same segment(s) (e.g. userRoot covers ["user", id], ["user", "me"] and
// ["user", "by-username", ...]) — they are intentionally broad; do not narrow.
export const queryKeys = {
  tournaments: ["tournaments"] as const,
  userRoot: ["user"] as const,
  profileCalendarRoot: ["profile-calendar"] as const,
  myTrainingsRoot: ["my-trainings"] as const,
  publicTrainingsRoot: ["public-trainings"] as const,
  publicRacketsRoot: ["public-rackets"] as const,
  tournamentJoinRequestsForTournament: (id: number) => ["tournament-join-requests", id] as const,
  upcomingCalendar: (limit: number) => ["upcoming-calendar", limit] as const,
  tournament: (id?: number) => ["tournament", id ?? "unknown"] as const,
  tournamentPhases: (id?: number) => ["tournament-phases", id ?? "unknown"] as const,
  tournamentPlayers: (id?: number) => ["tournament-players", id ?? "unknown"] as const,
  tournamentMatches: (id?: number) => ["tournament-matches", id ?? "unknown"] as const,
  tournamentBracket: (id?: number) => ["tournament-bracket", id ?? "unknown"] as const,
  myJoinRequests: ["my-join-requests"] as const,
  tournamentJoinRequests: (id?: number, status?: string) =>
    ["tournament-join-requests", id ?? "unknown", status ?? "all"] as const,
  clubs: ["clubs"] as const,
  clubContactRequests: ["club-contact-requests"] as const,
  club: (id?: number) => ["club", id ?? "unknown"] as const,
  clubAdmins: (id?: number) => ["club-admins", id ?? "unknown"] as const,
  players: ["players"] as const,
  player: (id?: number) => ["player", id ?? "unknown"] as const,
  match: (id?: number) => ["match", id ?? "unknown"] as const,
  users: ["users"] as const,
  user: (userId?: number) => ["user", userId ?? "unknown"] as const,
  userByUsername: (username?: string) => ["user", "by-username", username ?? "unknown"] as const,
  me: ["user", "me"] as const,
  userMatchActivity: (userId?: number, from?: string, to?: string) =>
    ["user-match-activity", userId ?? "unknown", from ?? "na", to ?? "na"] as const,
  userTournaments: (userId?: number) => ["user-tournaments", userId ?? "unknown"] as const,
  userRatingHistory: (userId?: number, limit?: number) =>
    ["user-rating-history", userId ?? "unknown", limit ?? 50] as const,
  userProfileCalendar: (userId?: number, from?: string, to?: string, timezone?: string) =>
    ["profile-calendar", "user", userId ?? "unknown", from ?? "na", to ?? "na", timezone ?? "utc"] as const,
  myProfileCalendar: (from?: string, to?: string, timezone?: string) =>
    ["profile-calendar", "me", from ?? "na", to ?? "na", timezone ?? "utc"] as const,
  publicRackets: (userId?: number) => ["public-rackets", userId ?? "unknown"] as const,
  myRackets: ["my-rackets"] as const,
  publicRacketDetails: (userId?: number, racketId?: number) =>
    ["public-racket-details", userId ?? "unknown", racketId ?? "unknown"] as const,
  myRacketDetails: (racketId?: number) => ["my-racket-details", racketId ?? "unknown"] as const,
  publicTrainings: (userId?: number, from?: string, to?: string) =>
    ["public-trainings", userId ?? "unknown", from ?? "na", to ?? "na"] as const,
  myTrainings: (from?: string, to?: string) => ["my-trainings", from ?? "na", to ?? "na"] as const,
};
