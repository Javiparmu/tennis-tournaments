"use client";

import { useAuth } from "@clerk/nextjs";
import { type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "@courtrank/core/api/rackets";
import type {
  CreateRacketRequest,
  CreateRacketStringingRequest,
  RacketSummary,
  UpdateRacketRequest,
  UpdateRacketStringingRequest,
} from "@courtrank/core/models";
import { queryKeys } from "@courtrank/core/queries/keys";
import { optimistic, removeById } from "@courtrank/core/queries/optimistic";

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

// Keys touched by any racket/stringing write, for background reconcile on settle.
function racketKeys(racketId?: number): QueryKey[] {
  const keys: QueryKey[] = [queryKeys.myRackets, queryKeys.publicRacketsRoot];
  if (racketId != null) keys.push(queryKeys.myRacketDetails(racketId));
  return keys;
}

export function useCreateRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateRacketRequest) => createRacket(await getToken(), payload),
    ...optimistic<CreateRacketRequest, unknown>(queryClient, { invalidate: () => racketKeys() }),
  });
}

export function useUpdateRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ racketId, payload }: { racketId: number; payload: UpdateRacketRequest }) =>
      updateRacket(await getToken(), racketId, payload),
    ...optimistic<{ racketId: number; payload: UpdateRacketRequest }, unknown>(queryClient, {
      invalidate: ({ racketId }) => racketKeys(racketId),
    }),
  });
}

export function useDeleteRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (racketId: number) => deleteRacket(await getToken(), racketId),
    ...optimistic<number, void>(queryClient, {
      targets: (racketId) => [
        { key: queryKeys.myRackets, patch: (prev) => removeById(prev as RacketSummary[] | undefined, racketId) },
      ],
      invalidate: () => racketKeys(),
    }),
  });
}

export function useCreateStringingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ racketId, payload }: { racketId: number; payload: CreateRacketStringingRequest }) =>
      createStringing(await getToken(), racketId, payload),
    ...optimistic<{ racketId: number; payload: CreateRacketStringingRequest }, unknown>(queryClient, {
      invalidate: ({ racketId }) => racketKeys(racketId),
    }),
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
    ...optimistic<{ racketId: number; stringingId: number; payload: UpdateRacketStringingRequest }, unknown>(
      queryClient,
      {
        invalidate: ({ racketId }) => racketKeys(racketId),
      },
    ),
  });
}

export function useDeleteStringingMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ racketId, stringingId }: { racketId: number; stringingId: number }) =>
      deleteStringing(await getToken(), racketId, stringingId),
    ...optimistic<{ racketId: number; stringingId: number }, void>(queryClient, {
      invalidate: ({ racketId }) => racketKeys(racketId),
    }),
  });
}
