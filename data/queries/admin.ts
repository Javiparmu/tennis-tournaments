"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminClub,
  deleteAdminClubContactRequest,
  getAdminClubContactRequests,
  getAdminClubs,
  getAdminOverview,
} from "@/data/api/admin";
import type { AdminClubContactRequest, Club, CreateClubRequest } from "@/models";
import { queryKeys } from "./keys";
import { optimistic, removeById } from "./optimistic";
import { useMeQuery } from "./users";

function useIsPlatformAdmin() {
  const me = useMeQuery();
  return me.data?.role === "PLATFORM_ADMIN";
}

export function useAdminOverviewQuery() {
  const isAdmin = useIsPlatformAdmin();
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.adminOverview,
    queryFn: async () => getAdminOverview(await getToken()),
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useAdminClubContactRequestsQuery() {
  const isAdmin = useIsPlatformAdmin();
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.adminClubContactRequests,
    queryFn: async () => getAdminClubContactRequests(await getToken()),
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useAdminClubsQuery() {
  const isAdmin = useIsPlatformAdmin();
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.adminClubs,
    queryFn: async () => getAdminClubs(await getToken()),
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useDeleteAdminClubContactRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deleteAdminClubContactRequest(await getToken(), id),
    ...optimistic<number, void>(queryClient, {
      targets: (id) => [
        {
          key: queryKeys.adminClubContactRequests,
          patch: (prev) => removeById(prev as AdminClubContactRequest[] | undefined, id),
        },
      ],
      invalidate: () => [queryKeys.adminRoot],
    }),
  });
}

export function useCreateAdminClubMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateClubRequest) => createAdminClub(await getToken(), payload),
    ...optimistic<CreateClubRequest, Club>(queryClient, {
      invalidate: () => [queryKeys.adminRoot, queryKeys.clubs],
    }),
  });
}
