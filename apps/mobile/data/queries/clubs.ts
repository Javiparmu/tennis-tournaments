import {
  addClubAdmin,
  type Club,
  type ClubContactRequestPayload,
  getClub,
  getClubAdmins,
  getClubs,
  mergeDefined,
  optimistic,
  queryKeys,
  removeClubAdmin,
  sendClubContactRequest,
  updateClub,
  type UpdateClubRequest,
  updateById,
} from "@courtrank/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/clerk";
import { useMeQuery } from "./users";

// Mobile club data layer — the Clerk-Expo counterpart of apps/web/data/queries/clubs.ts
// (and host.ts). Same query keys and optimistic wiring; only the token source differs
// (mobile's useAuth vs @clerk/nextjs). Admin-only club creation lives in
// data/queries/admin.ts; this file is the owner/host surface. Every mutation is also
// authorized server-side; the canManage gate here is UI-only.

export function useClubsQuery() {
  return useQuery({ queryKey: queryKeys.clubs, queryFn: getClubs, staleTime: 30_000 });
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

// Public contact request: a club asks to be provisioned. The admin reviews the queue
// in /admin and creates the club from there.
export function useClubContactRequestMutation() {
  return useMutation({
    mutationFn: async (payload: ClubContactRequestPayload) => sendClubContactRequest(payload),
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

// True when the signed-in user owns or administers the given club — gates the host
// management controls. Comes from /users/me (managedClubIds); the backend still
// authorizes every mutation server-side.
export function useCanManageClub(clubId?: number): boolean {
  const me = useMeQuery();
  if (clubId == null) return false;
  return (me.data?.managedClubIds ?? []).includes(clubId);
}
