import {
  type AdminClubContactRequest,
  type Club,
  type CreateClubRequest,
  createAdminClub,
  deleteAdminClubContactRequest,
  getAdminClubContactRequests,
  getAdminClubs,
  getAdminOverview,
  optimistic,
  queryKeys,
  removeById,
} from "@courtrank/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/clerk";
import { useMeQuery } from "./users";

// Admin data layer for mobile — the Clerk-Expo counterpart of
// apps/web/data/queries/admin.ts. Same query keys and optimistic wiring; only the
// token source differs (mobile's useAuth vs @clerk/nextjs). Every call is also
// authorized server-side; the isAdmin gate here is UI-only.
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
