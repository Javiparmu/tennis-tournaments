"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMatch, updateMatchScore } from "@/data/api/matches";
import type { UpdateMatchScoreRequest } from "@/models";
import { queryKeys } from "./keys";

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
    onSuccess: async (match) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.match(match.id) });
      if (tournamentId != null) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.tournamentBracket(tournamentId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.tournamentMatches(tournamentId) });
      }
    },
  });
}
