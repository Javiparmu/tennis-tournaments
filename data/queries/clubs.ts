"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addClubAdmin,
  createClub,
  deleteClub,
  getClub,
  getClubAdmins,
  getClubs,
  removeClubAdmin,
  updateClub,
} from "@/data/api/clubs";
import type { CreateClubRequest, UpdateClubRequest } from "@/models";
import { queryKeys } from "./keys";

export function useClubsQuery() {
  return useQuery({
    queryKey: queryKeys.clubs,
    queryFn: getClubs,
    staleTime: 30_000,
  });
}

export function useClubQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.club(id),
    queryFn: () => getClub(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useClubAdminsQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.clubAdmins(id),
    queryFn: () => getClubAdmins(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useCreateClubMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateClubRequest) => createClub(await getToken(), payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clubs });
    },
  });
}

export function useUpdateClubMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateClubRequest) => updateClub(await getToken(), payload),
    onSuccess: async (club) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clubs });
      await queryClient.invalidateQueries({ queryKey: queryKeys.club(club.id) });
    },
  });
}

export function useDeleteClubMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deleteClub(await getToken(), id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clubs });
    },
  });
}

export function useAddClubAdminMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ clubId, userId }: { clubId: number; userId: number }) =>
      addClubAdmin(await getToken(), clubId, userId),
    onSuccess: async (_void, { clubId }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clubAdmins(clubId) });
    },
  });
}

export function useRemoveClubAdminMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ clubId, userId }: { clubId: number; userId: number }) =>
      removeClubAdmin(await getToken(), clubId, userId),
    onSuccess: async (_void, { clubId }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clubAdmins(clubId) });
    },
  });
}
