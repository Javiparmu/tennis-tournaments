"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  TournamentJoinRequestStatus,
  UpdateTournamentRequest,
} from "@/models";
import { queryKeys } from "./keys";

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

async function invalidateTournament(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: number,
) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.tournaments });
  if (id != null) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tournament(id) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.tournamentBracket(id) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.tournamentPlayers(id) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.tournamentPhases(id) });
  }
}

export function useCreateTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateTournamentRequest) => createTournament(await getToken(), payload),
    onSuccess: (tournament) => invalidateTournament(queryClient, tournament.id),
  });
}

export function useUpdateTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateTournamentRequest) => updateTournament(await getToken(), payload),
    onSuccess: (tournament) => invalidateTournament(queryClient, tournament.id),
  });
}

export function useDeleteTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => deleteTournament(await getToken(), id),
    onSuccess: () => invalidateTournament(queryClient),
  });
}

export function useStartTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => startTournament(await getToken(), id),
    onSuccess: (tournament) => invalidateTournament(queryClient, tournament.id),
  });
}

export function useResetTournamentMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => resetTournament(await getToken(), id),
    onSuccess: (tournament) => invalidateTournament(queryClient, tournament.id),
  });
}

export function useCreatePhaseMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CreatePhaseRequest }) =>
      createPhase(await getToken(), id, payload),
    onSuccess: (_phase, { id }) => invalidateTournament(queryClient, id),
  });
}

export function useAddTournamentPlayersMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: AddPlayersRequest }) =>
      addTournamentPlayers(await getToken(), id, payload),
    onSuccess: (tournament) => invalidateTournament(queryClient, tournament.id),
  });
}

export function useRemoveTournamentPlayerMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, playerId }: { id: number; playerId: number }) =>
      removeTournamentPlayer(await getToken(), id, playerId),
    onSuccess: (_void, { id }) => invalidateTournament(queryClient, id),
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
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myJoinRequests });
      await invalidateTournament(queryClient, request.tournamentId);
    },
  });
}

export function useWithdrawJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, requestId }: { id: number; requestId: number }) =>
      withdrawJoinRequest(await getToken(), id, requestId),
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myJoinRequests });
      await invalidateTournament(queryClient, request.tournamentId);
    },
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

async function invalidateJoinRequests(
  queryClient: ReturnType<typeof useQueryClient>,
  tournamentId: number,
) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.tournamentJoinRequestsForTournament(tournamentId) });
  await invalidateTournament(queryClient, tournamentId);
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
    onSuccess: (request) => invalidateJoinRequests(queryClient, request.tournamentId),
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
    onSuccess: (request) => invalidateJoinRequests(queryClient, request.tournamentId),
  });
}

export function useAllowResubmitJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, requestId }: { id: number; requestId: number }) =>
      allowResubmitJoinRequest(await getToken(), id, requestId),
    onSuccess: (request) => invalidateJoinRequests(queryClient, request.tournamentId),
  });
}
