"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTraining,
  deleteTraining,
  getMyTrainings,
  getPublicTrainings,
  updateTraining,
} from "@/data/api/trainings";
import type { CreateTrainingRequest, UpdateTrainingRequest } from "@/models";
import { queryKeys } from "./keys";

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
