import {
  getMe,
  getMyProfileCalendar,
  getUser,
  getUserByUsername,
  getUserProfileCalendar,
  getUserRatingHistory,
  getUsers,
  getUserTournaments,
  optimistic,
  type OptimisticTarget,
  queryKeys,
  updateMe,
  type User,
} from "@courtrank/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/clerk";

export function useUsersQuery() {
  return useQuery({ queryKey: queryKeys.users, queryFn: getUsers, staleTime: 30_000 });
}

export function useUserByUsernameQuery(username?: string) {
  return useQuery({
    queryKey: queryKeys.userByUsername(username),
    queryFn: () => getUserByUsername(username as string),
    enabled: Boolean(username),
    staleTime: 30_000,
  });
}

export function useUserQuery(userId?: number) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => getUser(userId as number),
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useMeQuery() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => getMe(await getToken()),
    enabled: isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function useUserRatingHistoryQuery(userId?: number, limit = 50) {
  return useQuery({
    queryKey: queryKeys.userRatingHistory(userId, limit),
    queryFn: () => getUserRatingHistory(userId as number, limit),
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useUserTournamentsQuery(userId?: number) {
  return useQuery({
    queryKey: queryKeys.userTournaments(userId),
    queryFn: () => getUserTournaments(userId as number),
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useMyProfileCalendarQuery(from?: string, to?: string, timezone?: string) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.myProfileCalendar(from, to, timezone),
    queryFn: async () => getMyProfileCalendar(await getToken(), from as string, to as string, timezone as string),
    enabled: isLoaded && isSignedIn && Boolean(from) && Boolean(to) && Boolean(timezone),
    staleTime: 30_000,
  });
}

export function useUserProfileCalendarQuery(userId?: number, from?: string, to?: string, timezone?: string) {
  return useQuery({
    queryKey: queryKeys.userProfileCalendar(userId, from, to, timezone),
    queryFn: () => getUserProfileCalendar(userId as number, from as string, to as string, timezone as string),
    enabled: userId != null && Boolean(from) && Boolean(to) && Boolean(timezone),
    staleTime: 30_000,
  });
}

// Name/username edit (avatar upload is a follow-up). Paints the me + by-username
// caches optimistically; userRoot invalidation reconciles the slugified username.
type UpdateMeVars = { name?: string | null; username?: string | null };

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (vars: UpdateMeVars) => updateMe(await getToken(), vars),
    ...optimistic<UpdateMeVars, User>(queryClient, {
      targets: (vars) => {
        const me = queryClient.getQueryData<User>(queryKeys.me);
        const patch = (previous: unknown) =>
          previous
            ? {
                ...(previous as User),
                ...(vars.name !== undefined ? { name: vars.name } : {}),
                ...(vars.username !== undefined ? { username: vars.username } : {}),
              }
            : previous;
        const targets: OptimisticTarget<UpdateMeVars>[] = [{ key: queryKeys.me, patch }];
        if (me?.username) targets.push({ key: queryKeys.userByUsername(me.username), patch });
        return targets;
      },
      invalidate: () => [queryKeys.userRoot],
    }),
  });
}
