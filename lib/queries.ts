"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  getMe,
  getMyRackets,
  getPublicRackets,
  getTournaments,
  getUpcomingCalendar,
  getUser,
  getUserMatchActivity,
} from "./api";

export const queryKeys = {
  tournaments: ["tournaments"] as const,
  upcomingCalendar: (limit: number) => ["upcoming-calendar", limit] as const,
  user: (userId?: number) => ["user", userId ?? "unknown"] as const,
  me: ["user", "me"] as const,
  userMatchActivity: (userId?: number, from?: string, to?: string) =>
    ["user-match-activity", userId ?? "unknown", from ?? "na", to ?? "na"] as const,
  publicRackets: (userId?: number) => ["public-rackets", userId ?? "unknown"] as const,
  myRackets: ["my-rackets"] as const,
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

export function useUserQuery(userId?: number) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => getUser(userId as number),
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useMeQuery() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => getMe(await getToken()),
    enabled: isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function useUserMatchActivityQuery(userId?: number, from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.userMatchActivity(userId, from, to),
    queryFn: () => getUserMatchActivity(userId as number, from as string, to as string),
    enabled: userId != null && Boolean(from) && Boolean(to),
    staleTime: 30_000,
  });
}

export function usePublicRacketsQuery(userId?: number) {
  return useQuery({
    queryKey: queryKeys.publicRackets(userId),
    queryFn: () => getPublicRackets(userId as number),
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useMyRacketsQuery(enabled = true) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.myRackets,
    queryFn: async () => getMyRackets(await getToken()),
    enabled: enabled && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}
