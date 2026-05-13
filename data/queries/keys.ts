export const queryKeys = {
  tournaments: ["tournaments"] as const,
  upcomingCalendar: (limit: number) => ["upcoming-calendar", limit] as const,
  user: (userId?: number) => ["user", userId ?? "unknown"] as const,
  me: ["user", "me"] as const,
  userMatchActivity: (userId?: number, from?: string, to?: string) =>
    ["user-match-activity", userId ?? "unknown", from ?? "na", to ?? "na"] as const,
  userProfileCalendar: (userId?: number, from?: string, to?: string, timezone?: string) =>
    ["profile-calendar", "user", userId ?? "unknown", from ?? "na", to ?? "na", timezone ?? "utc"] as const,
  myProfileCalendar: (from?: string, to?: string, timezone?: string) =>
    ["profile-calendar", "me", from ?? "na", to ?? "na", timezone ?? "utc"] as const,
  publicRackets: (userId?: number) => ["public-rackets", userId ?? "unknown"] as const,
  myRackets: ["my-rackets"] as const,
  publicTrainings: (userId?: number, from?: string, to?: string) =>
    ["public-trainings", userId ?? "unknown", from ?? "na", to ?? "na"] as const,
  myTrainings: (from?: string, to?: string) => ["my-trainings", from ?? "na", to ?? "na"] as const,
};
