"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRacket,
  createStringing,
  deleteRacket,
  deleteStringing,
  getMyRacketDetails,
  getMyRackets,
  getPublicRacketDetails,
  getPublicRackets,
  updateRacket,
  updateStringing,
} from "@/data/api/rackets";
import type {
  CreateRacketRequest,
  CreateRacketStringingRequest,
  UpdateRacketRequest,
  UpdateRacketStringingRequest,
} from "@/models";
import { queryKeys } from "./keys";

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

export function usePublicRacketDetailsQuery(userId?: number, racketId?: number) {
  return useQuery({
    queryKey: queryKeys.publicRacketDetails(userId, racketId),
    queryFn: () => getPublicRacketDetails(userId as number, racketId as number),
    enabled: userId != null && racketId != null,
    staleTime: 30_000,
  });
}

export function useMyRacketDetailsQuery(racketId?: number, enabled = true) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.myRacketDetails(racketId),
    queryFn: async () => getMyRacketDetails(await getToken(), racketId as number),
    enabled: enabled && isLoaded && isSignedIn && racketId != null,
    staleTime: 30_000,
  });
}

async function invalidateRackets(
  queryClient: ReturnType<typeof useQueryClient>,
  racketId?: number,
) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.myRackets });
  await queryClient.invalidateQueries({ queryKey: queryKeys.publicRacketsRoot });
  if (racketId != null) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.myRacketDetails(racketId) });
  }
}

export function useCreateRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateRacketRequest) => createRacket(await getToken(), payload),
    onSuccess: () => invalidateRackets(queryClient),
  });
}

export function useUpdateRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ racketId, payload }: { racketId: number; payload: UpdateRacketRequest }) =>
      updateRacket(await getToken(), racketId, payload),
    onSuccess: (racket) => invalidateRackets(queryClient, racket.id),
  });
}

export function useDeleteRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (racketId: number) => deleteRacket(await getToken(), racketId),
    onSuccess: () => invalidateRackets(queryClient),
  });
}

export function useCreateStringingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ racketId, payload }: { racketId: number; payload: CreateRacketStringingRequest }) =>
      createStringing(await getToken(), racketId, payload),
    onSuccess: (_entry, { racketId }) => invalidateRackets(queryClient, racketId),
  });
}

export function useUpdateStringingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      racketId,
      stringingId,
      payload,
    }: {
      racketId: number;
      stringingId: number;
      payload: UpdateRacketStringingRequest;
    }) => updateStringing(await getToken(), racketId, stringingId, payload),
    onSuccess: (_entry, { racketId }) => invalidateRackets(queryClient, racketId),
  });
}

export function useDeleteStringingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ racketId, stringingId }: { racketId: number; stringingId: number }) =>
      deleteStringing(await getToken(), racketId, stringingId),
    onSuccess: (_void, { racketId }) => invalidateRackets(queryClient, racketId),
  });
}
