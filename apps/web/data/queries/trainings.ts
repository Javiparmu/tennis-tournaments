"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTraining,
  deleteTraining,
  getMyTrainings,
  getPublicTrainings,
  updateTraining,
} from "@courtrank/core/api/trainings";
import type { CreateTrainingRequest, UpdateTrainingRequest } from "@courtrank/core/models";
import { queryKeys } from "@courtrank/core/queries/keys";
import { optimistic } from "@courtrank/core/queries/optimistic";

// Training lists and the calendar are keyed by (from, to[, timezone]); an
// optimistic splice into every cached range is fragile, so these mutations paint
// nothing and lean on the non-awaited background reconcile (fast, and the modal
// still closes immediately). Errors surface via the shared danger toast.
const TRAINING_ROOTS = [queryKeys.profileCalendarRoot, queryKeys.myTrainingsRoot, queryKeys.publicTrainingsRoot];

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
    ...optimistic<CreateTrainingRequest, unknown>(queryClient, { invalidate: () => TRAINING_ROOTS }),
  });
}

export function useUpdateTrainingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ trainingId, payload }: { trainingId: number; payload: UpdateTrainingRequest }) =>
      updateTraining(await getToken(), trainingId, payload),
    ...optimistic<{ trainingId: number; payload: UpdateTrainingRequest }, unknown>(queryClient, {
      invalidate: () => TRAINING_ROOTS,
    }),
  });
}

export function useDeleteTrainingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (trainingId: number) => deleteTraining(await getToken(), trainingId),
    ...optimistic<number, unknown>(queryClient, { invalidate: () => TRAINING_ROOTS }),
  });
}
