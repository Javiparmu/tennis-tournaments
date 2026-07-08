"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  addClubAdmin,
  createClub,
  deleteClubContactRequest,
  getClub,
  getClubAdmins,
  getClubContactRequests,
  getClubs,
  removeClubAdmin,
  sendClubContactRequest,
  updateClub,
} from "@/data/api/clubs";
import type {
  Club,
  ClubContactRequest,
  ClubContactRequestPayload,
  CreateClubRequest,
  UpdateClubRequest,
} from "@/models";
import { queryKeys } from "./keys";
import { mergeDefined, optimistic, removeById, updateById } from "./optimistic";
import { useMeQuery } from "./users";

export function useClubsQuery() {
  return useQuery({
    queryKey: queryKeys.clubs,
    queryFn: getClubs,
    staleTime: 30_000,
  });
}

// clubId → club name lookup, derived from the shared clubs query. Tournaments
// only carry `clubId`; use this to show the real hosting club instead of a
// generic placeholder. Returns a Map so a list can resolve every card in one pass.
export function useClubNameMap() {
  const { data } = useClubsQuery();
  return useMemo(() => {
    const map = new Map<number, string>();
    for (const club of data ?? []) map.set(club.id, club.name);
    return map;
  }, [data]);
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

export function useClubContactRequestMutation() {
  return useMutation({
    mutationFn: async (payload: ClubContactRequestPayload) => sendClubContactRequest(payload),
  });
}

// Admin review queue (/admin). Only fetches for platform admins — the endpoint
// 403s for everyone else anyway.
export function useClubContactRequestsQuery() {
  const me = useMeQuery();
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.clubContactRequests,
    queryFn: async () => getClubContactRequests(await getToken()),
    enabled: me.data?.role === "PLATFORM_ADMIN",
    staleTime: 30_000,
  });
}

export function useDeleteClubContactRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deleteClubContactRequest(await getToken(), id),
    ...optimistic<number, void>(queryClient, {
      targets: (id) => [
        {
          key: queryKeys.clubContactRequests,
          patch: (prev) => removeById(prev as ClubContactRequest[] | undefined, id),
        },
      ],
      invalidate: () => [queryKeys.clubContactRequests],
    }),
  });
}

// Platform admin only (/admin): provisions a club for an existing owner user.
export function useCreateClubMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateClubRequest) => createClub(await getToken(), payload),
    ...optimistic<CreateClubRequest, unknown>(queryClient, { invalidate: () => [queryKeys.clubs] }),
  });
}

export function useUpdateClubMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateClubRequest) => updateClub(await getToken(), payload),
    ...optimistic<UpdateClubRequest, Club>(queryClient, {
      targets: (vars) => {
        const changes = { name: vars.name, phoneNumber: vars.phoneNumber, address: vars.address };
        return [
          { key: queryKeys.club(vars.id), patch: (prev) => (prev ? mergeDefined(prev as Club, changes) : prev) },
          {
            key: queryKeys.clubs,
            patch: (prev) => updateById(prev as Club[] | undefined, vars.id, (row) => mergeDefined(row, changes)),
          },
        ];
      },
      invalidate: (vars) => [queryKeys.clubs, queryKeys.club(vars.id)],
    }),
  });
}

export function useAddClubAdminMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ clubId, userId }: { clubId: number; userId: number }) =>
      addClubAdmin(await getToken(), clubId, userId),
    ...optimistic<{ clubId: number; userId: number }, void>(queryClient, {
      invalidate: ({ clubId }) => [queryKeys.clubAdmins(clubId)],
    }),
  });
}

export function useRemoveClubAdminMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ clubId, userId }: { clubId: number; userId: number }) =>
      removeClubAdmin(await getToken(), clubId, userId),
    ...optimistic<{ clubId: number; userId: number }, void>(queryClient, {
      invalidate: ({ clubId }) => [queryKeys.clubAdmins(clubId)],
    }),
  });
}
