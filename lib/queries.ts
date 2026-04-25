"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTraining,
  deleteTraining,
  getMe,
  getMyProfileCalendar,
  getMyRackets,
  getMyTrainings,
  getPublicRackets,
  getTournaments,
  getUpcomingCalendar,
  getUser,
  getUserProfileCalendar,
  getUserMatchActivity,
  getPublicTrainings,
  updateTraining,
} from "./api";
import type { CreateTrainingRequest, UpdateTrainingRequest } from "./types";

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

export function usePublicTrainingsQuery(userId?: number, from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.publicTrainings(userId, from, to),
    queryFn: () => getPublicTrainings(userId as number, from as string, to as string),
    enabled: userId != null && Boolean(from) && Boolean(to),
    staleTime: 30_000,
  });
}

export function useMyTrainingsQuery(enabled = true, from?: string, to?: string) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.myTrainings(from, to),
    queryFn: async () => getMyTrainings(await getToken(), from as string, to as string),
    enabled: enabled && isLoaded && isSignedIn && Boolean(from) && Boolean(to),
    staleTime: 30_000,
  });
}

export function useCreateTrainingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateTrainingRequest) => createTraining(await getToken(), payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile-calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["my-trainings"] });
      await queryClient.invalidateQueries({ queryKey: ["public-trainings"] });
    },
  });
}

export function useUpdateTrainingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ trainingId, payload }: { trainingId: number; payload: UpdateTrainingRequest }) =>
      updateTraining(await getToken(), trainingId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile-calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["my-trainings"] });
      await queryClient.invalidateQueries({ queryKey: ["public-trainings"] });
    },
  });
}

export function useDeleteTrainingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (trainingId: number) => deleteTraining(await getToken(), trainingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile-calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["my-trainings"] });
      await queryClient.invalidateQueries({ queryKey: ["public-trainings"] });
    },
  });
}
