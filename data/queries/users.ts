"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  getMyProfileCalendar,
  getUser,
  getUserByUsername,
  getUserMatchActivity,
  getUserProfileCalendar,
  getUsers,
  getUserTournaments,
  updateMe,
} from "@/data/api/users";
import type { UpdateUserRequest } from "@/models";
import { queryKeys } from "./keys";

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: getUsers,
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

export function useUserByUsernameQuery(username?: string) {
  return useQuery({
    queryKey: queryKeys.userByUsername(username),
    queryFn: () => getUserByUsername(username as string),
    enabled: Boolean(username),
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

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateUserRequest) => updateMe(await getToken(), payload),
    // Covers both ["user", "me"] and ["user", id] by prefix.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
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

export function useUserTournamentsQuery(userId?: number) {
  return useQuery({
    queryKey: queryKeys.userTournaments(userId),
    queryFn: () => getUserTournaments(userId as number),
    enabled: userId != null,
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
