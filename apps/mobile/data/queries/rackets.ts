import {
  type CreateRacketRequest,
  createRacket,
  deleteRacket,
  getMyRackets,
  getPublicRackets,
  optimistic,
  queryKeys,
} from "@courtrank/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/clerk";

const RACKET_ROOTS = [queryKeys.myRackets, queryKeys.publicRacketsRoot];

export function useMyRacketsQuery(enabled = true) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.myRackets,
    queryFn: async () => getMyRackets(await getToken()),
    enabled: enabled && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function usePublicRacketsQuery(userId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.publicRackets(userId),
    queryFn: () => getPublicRackets(userId as number),
    enabled: enabled && userId != null,
    staleTime: 30_000,
  });
}

export function useCreateRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (payload: CreateRacketRequest) => createRacket(await getToken(), payload),
    ...optimistic<CreateRacketRequest, unknown>(queryClient, { invalidate: () => RACKET_ROOTS }),
  });
}

export function useDeleteRacketMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (vars: { racketId: number }) => deleteRacket(await getToken(), vars.racketId),
    ...optimistic<{ racketId: number }, unknown>(queryClient, { invalidate: () => RACKET_ROOTS }),
  });
}
