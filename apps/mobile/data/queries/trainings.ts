import {
  type CreateTrainingRequest,
  createTraining,
  deleteTraining,
  getMyTrainings,
  getPublicTrainings,
  optimistic,
  queryKeys,
  type UpdateTrainingRequest,
  updateTraining,
} from "@courtrank/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/clerk";

// Broad roots reconciled after any training write.
const TRAINING_ROOTS = [queryKeys.myTrainingsRoot, queryKeys.publicTrainingsRoot, queryKeys.profileCalendarRoot];

export function useMyTrainingsQuery(from?: string, to?: string) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.myTrainings(from, to),
    queryFn: async () => getMyTrainings(await getToken(), from as string, to as string),
    enabled: isLoaded && isSignedIn && Boolean(from) && Boolean(to),
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
    mutationFn: async (vars: { trainingId: number; payload: UpdateTrainingRequest }) =>
      updateTraining(await getToken(), vars.trainingId, vars.payload),
    ...optimistic<{ trainingId: number; payload: UpdateTrainingRequest }, unknown>(queryClient, {
      invalidate: () => TRAINING_ROOTS,
    }),
  });
}

export function useDeleteTrainingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (vars: { trainingId: number }) => deleteTraining(await getToken(), vars.trainingId),
    ...optimistic<{ trainingId: number }, unknown>(queryClient, { invalidate: () => TRAINING_ROOTS }),
  });
}
