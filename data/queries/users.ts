"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import {
  getMe,
  getMyProfileCalendar,
  getUser,
  getUserMatchActivity,
  getUserProfileCalendar,
} from "@/data/api/users";
import { queryKeys } from "./keys";

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

export function useUserProfileCalendarQuery(userId?: number, from?: string, to?: string, timezone?: string) {
  return useQuery({
    queryKey: queryKeys.userProfileCalendar(userId, from, to, timezone),
    queryFn: () => getUserProfileCalendar(userId as number, from as string, to as string, timezone as string),
    enabled: userId != null && Boolean(from) && Boolean(to) && Boolean(timezone),
    staleTime: 30_000,
  });
}

export function useMyProfileCalendarQuery(enabled = true, from?: string, to?: string, timezone?: string) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.myProfileCalendar(from, to, timezone),
    queryFn: async () => getMyProfileCalendar(await getToken(), from as string, to as string, timezone as string),
    enabled: enabled && isLoaded && isSignedIn && Boolean(from) && Boolean(to) && Boolean(timezone),
    staleTime: 30_000,
  });
}
