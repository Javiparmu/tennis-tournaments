import {
  getMe,
  getUser,
  getUserByUsername,
  getUserRatingHistory,
  getUsers,
  getUserTournaments,
  queryKeys,
} from "@courtrank/core";
import { useQuery } from "@tanstack/react-query";
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
