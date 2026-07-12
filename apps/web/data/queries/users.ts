"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  getMyProfileCalendar,
  getUser,
  getUserByUsername,
  getUserMatchActivity,
  getUserProfileCalendar,
  getUserRatingHistory,
  getUsers,
  getUserTournaments,
  updateMe,
} from "@courtrank/core/api/users";
import type { UpdateUserRequest, User } from "@courtrank/core/models";
import { queryKeys } from "@courtrank/core/queries/keys";
import { optimistic, type OptimisticTarget } from "@courtrank/core/queries/optimistic";

// Vars for useUpdateMeMutation.
// - `payload` is what we persist. `imageUrl` is usually resolved lazily by
//   `prepare` (the Clerk upload returns the CDN URL), so it may be absent here.
// - `optimistic` is what onMutate paints into the cache *immediately*. For a
//   freshly-picked photo it carries a data URL so the avatar shows before the
//   slower Clerk upload finishes; falls back to `payload` when omitted.
// - `prepare` runs inside the mutation, before the PATCH: sync name to Clerk and/or
//   upload the photo, returning the CDN image URL to persist (or undefined to leave
//   imageUrl untouched). Keeping it inside the mutation lets onMutate paint up front
//   while the upload settles in the background.
// - `clerkTouched` mints a fresh token (skipCache) — a long upload can stale the
//   ~60s session token; a plain name/username edit reuses the cached one.
export type UpdateMeVars = {
  payload: UpdateUserRequest;
  optimistic?: UpdateUserRequest;
  prepare?: () => Promise<string | null | undefined>;
  clerkTouched: boolean;
};

// Apply only the fields present in the payload onto the cached user; leave the
// rest (rating, achievements, …) intact.
function patchUser(previous: unknown, payload: UpdateUserRequest): unknown {
  if (!previous) return previous;
  const user = previous as User;
  return {
    ...user,
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.username !== undefined ? { username: payload.username } : {}),
    ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
  };
}

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: getUsers,
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

export function useUserByUsernameQuery(username?: string) {
  return useQuery({
    queryKey: queryKeys.userByUsername(username),
    queryFn: () => getUserByUsername(username as string),
    enabled: Boolean(username),
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

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ payload, prepare, clerkTouched }: UpdateMeVars) => {
      const uploadedImageUrl = prepare ? await prepare() : undefined;
      const finalPayload = uploadedImageUrl !== undefined ? { ...payload, imageUrl: uploadedImageUrl } : payload;
      return updateMe(await getToken({ skipCache: clerkTouched }), finalPayload);
    },
    // Paint the new name/username/photo into both the ["user","me"] cache and the
    // by-username cache the profile page reads, so the card updates instantly — off
    // `optimistic` (a data URL for a new photo) rather than `payload`, whose CDN
    // imageUrl isn't known until the upload in `prepare` finishes. userRoot
    // invalidation (covers me / user(id) / by-username by prefix) reconciles in the
    // background, swapping the data URL for the real CDN URL.
    ...optimistic<UpdateMeVars, User>(queryClient, {
      targets: (vars) => {
        const values = vars.optimistic ?? vars.payload;
        const me = queryClient.getQueryData<User>(queryKeys.me);
        const patch = (previous: unknown) => patchUser(previous, values);
        const targets: OptimisticTarget<UpdateMeVars>[] = [{ key: queryKeys.me, patch }];
        if (me?.username) targets.push({ key: queryKeys.userByUsername(me.username), patch });
        return targets;
      },
      invalidate: () => [queryKeys.userRoot],
    }),
  });
}

export function useUserMatchActivityQuery(userId?: number, from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.userMatchActivity(userId, from, to),
    queryFn: () => getUserMatchActivity(userId as number, from as string, to as string),
    enabled: userId != null && Boolean(from) && Boolean(to),
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

export function useUserProfileCalendarQuery(userId?: number, from?: string, to?: string, timezone?: string) {
  return useQuery({
    queryKey: queryKeys.userProfileCalendar(userId, from, to, timezone),
    queryFn: () => getUserProfileCalendar(userId as number, from as string, to as string, timezone as string),
    enabled: userId != null && Boolean(from) && Boolean(to) && Boolean(timezone),
    staleTime: 30_000,
  });
}

export function useMyProfileCalendarQuery(enabled = true, from?: string, to?: string, timezone?: string) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.myProfileCalendar(from, to, timezone),
    queryFn: async () => getMyProfileCalendar(await getToken(), from as string, to as string, timezone as string),
    enabled: enabled && isLoaded && isSignedIn && Boolean(from) && Boolean(to) && Boolean(timezone),
    staleTime: 30_000,
  });
}
