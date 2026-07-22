"use client";

import { useAuth } from "@clerk/nextjs";
import { type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addLeagueMember,
  createLeague,
  deleteLeague,
  deleteLeagueMatch,
  getLeague,
  getLeagueMatches,
  getLeagueMembers,
  getMyLeagues,
  joinLeagueByCode,
  recordLeagueMatch,
  regenerateLeagueInviteCode,
  removeLeagueMember,
  updateLeague,
} from "@courtrank/core/api/leagues";
import type {
  AddLeagueMemberRequest,
  CreateLeagueRequest,
  JoinLeagueRequest,
  League,
  LeagueMatch,
  LeagueMember,
  RecordLeagueMatchRequest,
  UpdateLeagueRequest,
} from "@courtrank/core/models";
import { queryKeys } from "@courtrank/core/queries/keys";
import { mergeDefined, optimistic, removeById } from "@courtrank/core/queries/optimistic";

function leagueKeys(id?: number): QueryKey[] {
  const keys: QueryKey[] = [queryKeys.myLeagues];
  if (id != null) {
    keys.push(queryKeys.league(id), queryKeys.leagueMembers(id), queryKeys.leagueMatches(id));
  }
  return keys;
}

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
    ...optimistic<CreateLeagueRequest, League>(queryClient, {
      invalidate: (_vars, league) => leagueKeys(league?.id),
    }),
  });
}

export function useUpdateLeagueMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateLeagueRequest) => updateLeague(await getToken(), payload),
    ...optimistic<UpdateLeagueRequest, League>(queryClient, {
      targets: (vars) => [
        {
          key: queryKeys.league(vars.id),
          patch: (prev) => (prev ? mergeDefined(prev as League, vars) : prev),
        },
      ],
      invalidate: (vars) => leagueKeys(vars.id),
    }),
  });
}

export function useDeleteLeagueMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deleteLeague(await getToken(), id),
    ...optimistic<number, void>(queryClient, {
      targets: (id) => [{ key: queryKeys.myLeagues, patch: (prev) => removeById(prev as League[] | undefined, id) }],
      invalidate: () => [queryKeys.myLeagues],
    }),
  });
}

export function useJoinLeagueByCodeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: JoinLeagueRequest) => joinLeagueByCode(await getToken(), payload),
    ...optimistic<JoinLeagueRequest, League>(queryClient, {
      invalidate: (_vars, league) => leagueKeys(league?.id),
    }),
  });
}

export function useAddLeagueMemberMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: AddLeagueMemberRequest }) =>
      addLeagueMember(await getToken(), id, payload),
    ...optimistic<{ id: number; payload: AddLeagueMemberRequest }, LeagueMember>(queryClient, {
      invalidate: ({ id }) => leagueKeys(id),
    }),
  });
}

export function useRemoveLeagueMemberMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, playerId }: { id: number; playerId: number }) =>
      removeLeagueMember(await getToken(), id, playerId),
    ...optimistic<{ id: number; playerId: number }, void>(queryClient, {
      targets: ({ id, playerId }) => [
        {
          key: queryKeys.leagueMembers(id),
          patch: (prev) => (prev as LeagueMember[] | undefined)?.filter((member) => member.playerId !== playerId),
        },
      ],
      invalidate: ({ id }) => leagueKeys(id),
    }),
  });
}

export function useRecordLeagueMatchMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RecordLeagueMatchRequest }) =>
      recordLeagueMatch(await getToken(), id, payload),
    ...optimistic<{ id: number; payload: RecordLeagueMatchRequest }, LeagueMatch>(queryClient, {
      invalidate: ({ id }) => leagueKeys(id),
    }),
  });
}

export function useDeleteLeagueMatchMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, matchId }: { id: number; matchId: number }) =>
      deleteLeagueMatch(await getToken(), id, matchId),
    ...optimistic<{ id: number; matchId: number }, void>(queryClient, {
      targets: ({ id, matchId }) => [
        { key: queryKeys.leagueMatches(id), patch: (prev) => removeById(prev as LeagueMatch[] | undefined, matchId) },
      ],
      invalidate: ({ id }) => leagueKeys(id),
    }),
  });
}

export function useRegenerateLeagueInviteCodeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => regenerateLeagueInviteCode(await getToken(), id),
    ...optimistic<number, League>(queryClient, { invalidate: (id) => leagueKeys(id) }),
  });
}
