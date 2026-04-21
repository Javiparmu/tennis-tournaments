"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentPlayerProfile, getTournaments, getUpcomingCalendar } from "./api";

export const queryKeys = {
  tournaments: ["tournaments"] as const,
  upcomingCalendar: (limit: number) => ["upcoming-calendar", limit] as const,
  profile: (username?: string) => ["profile", username ?? "anonymous"] as const,
};

export function useTournamentsQuery() {
  return useQuery({
    queryKey: queryKeys.tournaments,
    queryFn: getTournaments,
    staleTime: 30_000,
  });
}

export function useUpcomingCalendarQuery(limit = 4) {
  return useQuery({
    queryKey: queryKeys.upcomingCalendar(limit),
    queryFn: () => getUpcomingCalendar(limit),
    staleTime: 30_000,
  });
}

export function useCurrentPlayerProfileQuery(username?: string) {
  return useQuery({
    queryKey: queryKeys.profile(username),
    queryFn: () => getCurrentPlayerProfile(username),
    staleTime: 30_000,
  });
}
