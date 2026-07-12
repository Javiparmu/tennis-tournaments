"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMatch, updateMatchScore } from "@courtrank/core/api/matches";
import type { UpdateMatchScoreRequest } from "@courtrank/core/models";
import { queryKeys } from "@courtrank/core/queries/keys";
import { optimistic } from "@courtrank/core/queries/optimistic";

export function useMatchQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.match(id),
    queryFn: () => getMatch(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useUpdateMatchScoreMutation(tournamentId?: number) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateMatchScoreRequest }) =>
      updateMatchScore(await getToken(), id, payload),
    // Reconcile-only: a score edit fans out into computed winner/status and the
    // bracket, so we let the background refetch recompute rather than merge by hand.
    ...optimistic<{ id: number; payload: UpdateMatchScoreRequest }, unknown>(queryClient, {
      invalidate: ({ id }) =>
        tournamentId != null
          ? [queryKeys.match(id), queryKeys.tournamentBracket(tournamentId), queryKeys.tournamentMatches(tournamentId)]
          : [queryKeys.match(id)],
    }),
  });
}
