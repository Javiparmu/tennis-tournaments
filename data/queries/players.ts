"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlayer, deletePlayer, getPlayer, getPlayers, updatePlayer } from "@/data/api/players";
import type { CreatePlayerRequest, UpdatePlayerRequest } from "@/models";
import { queryKeys } from "./keys";

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
}

export function useUpdatePlayerMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdatePlayerRequest) => updatePlayer(await getToken(), payload),
    onSuccess: async (player) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.players });
      await queryClient.invalidateQueries({ queryKey: queryKeys.player(player.id) });
    },
  });
}

export function useDeletePlayerMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deletePlayer(await getToken(), id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
}
