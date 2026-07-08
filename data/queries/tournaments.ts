"use client";

import { useAuth } from "@clerk/nextjs";
import { type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptJoinRequest,
  addTournamentPlayers,
  allowResubmitJoinRequest,
  createJoinRequest,
  createPhase,
  createTournament,
  deleteTournament,
  getMyJoinRequests,
  getTournament,
  getTournamentBracket,
  getTournamentJoinRequests,
  getTournamentMatches,
  getTournamentPhases,
  getTournamentPlayers,
  getTournaments,
  getUpcomingCalendar,
  rejectJoinRequest,
  removeTournamentPlayer,
  resetTournament,
  startTournament,
  updateTournament,
  withdrawJoinRequest,
} from "@/data/api/tournaments";
import type {
  AcceptTournamentJoinRequest,
  AddPlayersRequest,
  CreatePhaseRequest,
  CreateTournamentJoinRequest,
  CreateTournamentRequest,
  DecideTournamentJoinRequest,
  Player,
  Tournament,
  TournamentBasic,
  TournamentJoinRequestStatus,
  UpdateTournamentRequest,
} from "@/models";
import { queryKeys } from "./keys";
import { mergeDefined, optimistic, removeById, updateById } from "./optimistic";

export function useTournamentsQuery() {
  return useQuery({
    queryKey: queryKeys.tournaments,
    queryFn: getTournaments,
    staleTime: 30_000,
  });
}

export function useUpcomingCalendarQuery(limit = 4) {
  return useQuery({
    queryKey: queryKeys.upcomingCalendar(limit),
    queryFn: () => getUpcomingCalendar(limit),
    staleTime: 30_000,
  });
}

export function useTournamentQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.tournament(id),
    queryFn: () => getTournament(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentPhasesQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.tournamentPhases(id),
    queryFn: () => getTournamentPhases(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentPlayersQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.tournamentPlayers(id),
    queryFn: () => getTournamentPlayers(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentMatchesQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.tournamentMatches(id),
    queryFn: () => getTournamentMatches(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentBracketQuery(id?: number) {
  return useQuery({
    queryKey: queryKeys.tournamentBracket(id),
    queryFn: () => getTournamentBracket(id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

// Query keys touched by a tournament write, for background reconcile on settle.
function tournamentKeys(id?: number): QueryKey[] {
  const keys: QueryKey[] = [queryKeys.tournaments];
  if (id != null) {
    keys.push(
      queryKeys.tournament(id),
      queryKeys.tournamentBracket(id),
      queryKeys.tournamentPlayers(id),
      queryKeys.tournamentPhases(id),
    );
  }
  return keys;
}

export function useCreateTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateTournamentRequest) => createTournament(await getToken(), payload),
    ...optimistic<CreateTournamentRequest, Tournament>(queryClient, {
      invalidate: (_vars, tournament) => tournamentKeys(tournament?.id),
    }),
  });
}

export function useUpdateTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateTournamentRequest) => updateTournament(await getToken(), payload),
    ...optimistic<UpdateTournamentRequest, Tournament>(queryClient, {
      targets: (vars) => {
        const changes = {
          name: vars.name,
          description: vars.description,
          surface: vars.surface,
          clubId: vars.clubId,
          startDate: vars.startDate,
          endDate: vars.endDate,
        };
        return [
          {
            key: queryKeys.tournament(vars.id),
            patch: (prev) => (prev ? mergeDefined(prev as Tournament, changes) : prev),
          },
          {
            key: queryKeys.tournaments,
            patch: (prev) =>
              updateById(prev as TournamentBasic[] | undefined, vars.id, (row) => mergeDefined(row, changes)),
          },
        ];
      },
      invalidate: (vars) => tournamentKeys(vars.id),
    }),
  });
}

export function useDeleteTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deleteTournament(await getToken(), id),
    ...optimistic<number, void>(queryClient, {
      targets: (id) => [
        { key: queryKeys.tournaments, patch: (prev) => removeById(prev as TournamentBasic[] | undefined, id) },
      ],
      invalidate: () => tournamentKeys(),
    }),
  });
}

export function useStartTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => startTournament(await getToken(), id),
    ...optimistic<number, Tournament>(queryClient, { invalidate: (id) => tournamentKeys(id) }),
  });
}

export function useResetTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => resetTournament(await getToken(), id),
    ...optimistic<number, Tournament>(queryClient, { invalidate: (id) => tournamentKeys(id) }),
  });
}

export function useCreatePhaseMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CreatePhaseRequest }) =>
      createPhase(await getToken(), id, payload),
    ...optimistic<{ id: number; payload: CreatePhaseRequest }, unknown>(queryClient, {
      invalidate: ({ id }) => tournamentKeys(id),
    }),
  });
}

export function useAddTournamentPlayersMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: AddPlayersRequest }) =>
      addTournamentPlayers(await getToken(), id, payload),
    ...optimistic<{ id: number; payload: AddPlayersRequest }, Tournament>(queryClient, {
      invalidate: ({ id }) => tournamentKeys(id),
    }),
  });
}

export function useRemoveTournamentPlayerMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, playerId }: { id: number; playerId: number }) =>
      removeTournamentPlayer(await getToken(), id, playerId),
    ...optimistic<{ id: number; playerId: number }, void>(queryClient, {
      targets: ({ id, playerId }) => [
        { key: queryKeys.tournamentPlayers(id), patch: (prev) => removeById(prev as Player[] | undefined, playerId) },
      ],
      invalidate: ({ id }) => tournamentKeys(id),
    }),
  });
}

export function useMyJoinRequestsQuery() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.myJoinRequests,
    queryFn: async () => getMyJoinRequests(await getToken()),
    enabled: isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

export function useCreateJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CreateTournamentJoinRequest }) =>
      createJoinRequest(await getToken(), id, payload),
    ...optimistic<{ id: number; payload: CreateTournamentJoinRequest }, unknown>(queryClient, {
      invalidate: ({ id }) => [queryKeys.myJoinRequests, ...tournamentKeys(id)],
    }),
  });
}

export function useWithdrawJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, requestId }: { id: number; requestId: number }) =>
      withdrawJoinRequest(await getToken(), id, requestId),
    ...optimistic<{ id: number; requestId: number }, unknown>(queryClient, {
      invalidate: ({ id }) => [queryKeys.myJoinRequests, ...tournamentKeys(id)],
    }),
  });
}

export function useTournamentJoinRequestsQuery(id?: number, status?: TournamentJoinRequestStatus) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.tournamentJoinRequests(id, status),
    queryFn: async () => getTournamentJoinRequests(await getToken(), id as number, status),
    enabled: id != null && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

// Keys touched when a host decides on a join request (the tournament's request
// list plus everything a roster change affects).
function joinRequestKeys(tournamentId: number): QueryKey[] {
  return [queryKeys.tournamentJoinRequestsForTournament(tournamentId), ...tournamentKeys(tournamentId)];
}

export function useAcceptJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      requestId,
      payload = {},
    }: {
      id: number;
      requestId: number;
      payload?: AcceptTournamentJoinRequest;
    }) => acceptJoinRequest(await getToken(), id, requestId, payload),
    ...optimistic<{ id: number; requestId: number; payload?: AcceptTournamentJoinRequest }, unknown>(queryClient, {
      invalidate: ({ id }) => joinRequestKeys(id),
    }),
  });
}

export function useRejectJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      requestId,
      payload = {},
    }: {
      id: number;
      requestId: number;
      payload?: DecideTournamentJoinRequest;
    }) => rejectJoinRequest(await getToken(), id, requestId, payload),
    ...optimistic<{ id: number; requestId: number; payload?: DecideTournamentJoinRequest }, unknown>(queryClient, {
      invalidate: ({ id }) => joinRequestKeys(id),
    }),
  });
}

export function useAllowResubmitJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, requestId }: { id: number; requestId: number }) =>
      allowResubmitJoinRequest(await getToken(), id, requestId),
    ...optimistic<{ id: number; requestId: number }, unknown>(queryClient, {
      invalidate: ({ id }) => joinRequestKeys(id),
    }),
  });
}
