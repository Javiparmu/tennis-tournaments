import {
  type AddLeagueMemberRequest,
  addLeagueMember,
  type CreateLeagueRequest,
  createLeague,
  deleteLeagueMatch,
  getLeague,
  getLeagueMatches,
  getLeagueMembers,
  getMyLeagues,
  type JoinLeagueRequest,
  joinLeagueByCode,
  type League,
  optimistic,
  queryKeys,
  type RecordLeagueMatchRequest,
  recordLeagueMatch,
} from "@courtrank/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/clerk";

export function useMyLeaguesQuery() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.myLeagues,
    queryFn: async () => getMyLeagues(await getToken()),
    enabled: isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function useLeagueQuery(id?: number) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.league(id),
    queryFn: async () => getLeague(await getToken(), id as number),
    enabled: id != null && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function useLeagueMembersQuery(id?: number) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.leagueMembers(id),
    queryFn: async () => getLeagueMembers(await getToken(), id as number),
    enabled: id != null && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function useLeagueMatchesQuery(id?: number) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.leagueMatches(id),
    queryFn: async () => getLeagueMatches(await getToken(), id as number),
    enabled: id != null && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function useCreateLeagueMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (payload: CreateLeagueRequest) => createLeague(await getToken(), payload),
    ...optimistic<CreateLeagueRequest, League>(queryClient, { invalidate: () => [queryKeys.myLeagues] }),
  });
}

export function useJoinLeagueByCodeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (payload: JoinLeagueRequest) => joinLeagueByCode(await getToken(), payload),
    ...optimistic<JoinLeagueRequest, League>(queryClient, { invalidate: () => [queryKeys.myLeagues] }),
  });
}

export function useAddLeagueMemberMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: AddLeagueMemberRequest }) =>
      addLeagueMember(await getToken(), id, payload),
    ...optimistic<{ id: number; payload: AddLeagueMemberRequest }, unknown>(queryClient, {
      invalidate: ({ id }) => [queryKeys.leagueMembers(id)],
    }),
  });
}

export function useRecordLeagueMatchMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RecordLeagueMatchRequest }) =>
      recordLeagueMatch(await getToken(), id, payload),
    ...optimistic<{ id: number; payload: RecordLeagueMatchRequest }, unknown>(queryClient, {
      invalidate: ({ id }) => [queryKeys.leagueMembers(id), queryKeys.leagueMatches(id)],
    }),
  });
}

export function useDeleteLeagueMatchMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({ id, matchId }: { id: number; matchId: number }) =>
      deleteLeagueMatch(await getToken(), id, matchId),
    ...optimistic<{ id: number; matchId: number }, unknown>(queryClient, {
      invalidate: ({ id }) => [queryKeys.leagueMembers(id), queryKeys.leagueMatches(id)],
    }),
  });
}
