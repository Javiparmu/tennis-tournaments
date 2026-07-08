"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlayer, deletePlayer, getPlayer, getPlayers, updatePlayer } from "@/data/api/players";
import type { CreatePlayerRequest, Player, UpdatePlayerRequest } from "@/models";
import { queryKeys } from "./keys";
import { mergeDefined, optimistic, removeById, updateById } from "./optimistic";

export function usePlayersQuery() {
  return useQuery({
    queryKey: queryKeys.players,
    queryFn: getPlayers,
    staleTime: 30_000,
  });
}

export function usePlayerQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.player(id),
    queryFn: () => getPlayer(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useCreatePlayerMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreatePlayerRequest) => createPlayer(await getToken(), payload),
    ...optimistic<CreatePlayerRequest, unknown>(queryClient, { invalidate: () => [queryKeys.players] }),
  });
}

export function useUpdatePlayerMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdatePlayerRequest) => updatePlayer(await getToken(), payload),
    ...optimistic<UpdatePlayerRequest, Player>(queryClient, {
      targets: (vars) => {
        const rename = { name: vars.name };
        return [
          { key: queryKeys.player(vars.id), patch: (prev) => (prev ? mergeDefined(prev as Player, rename) : prev) },
          {
            key: queryKeys.players,
            patch: (prev) => updateById(prev as Player[] | undefined, vars.id, (row) => mergeDefined(row, rename)),
          },
        ];
      },
      invalidate: (vars) => [queryKeys.players, queryKeys.player(vars.id)],
    }),
  });
}

export function useDeletePlayerMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deletePlayer(await getToken(), id),
    ...optimistic<number, void>(queryClient, {
      targets: (id) => [{ key: queryKeys.players, patch: (prev) => removeById(prev as Player[] | undefined, id) }],
      invalidate: () => [queryKeys.players],
    }),
  });
}
