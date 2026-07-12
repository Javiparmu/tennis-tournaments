import {
  type CreateTournamentJoinRequest,
  createJoinRequest,
  getMyJoinRequests,
  getTournament,
  getTournamentBracket,
  getTournamentMatches,
  getTournamentPhases,
  getTournamentPlayers,
  getTournaments,
  getUpcomingCalendar,
  optimistic,
  queryKeys,
  withdrawJoinRequest,
} from "@courtrank/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth/clerk";

export function useTournamentsQuery() {
  return useQuery({ queryKey: queryKeys.tournaments, queryFn: getTournaments, staleTime: 30_000 });
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

export function useMyJoinRequestsQuery() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.myJoinRequests,
    queryFn: async () => getMyJoinRequests(await getToken()),
    enabled: isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}

type CreateJoinVars = { tournamentId: number; payload: CreateTournamentJoinRequest };
type WithdrawJoinVars = { tournamentId: number; requestId: number };

export function useCreateJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (vars: CreateJoinVars) => createJoinRequest(await getToken(), vars.tournamentId, vars.payload),
    // Reconcile-only: the join-request fan-out is fragile, so just refetch.
    ...optimistic<CreateJoinVars, unknown>(queryClient, {
      invalidate: (vars) => [queryKeys.myJoinRequests, queryKeys.tournament(vars.tournamentId)],
    }),
  });
}

export function useWithdrawJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (vars: WithdrawJoinVars) =>
      withdrawJoinRequest(await getToken(), vars.tournamentId, vars.requestId),
    ...optimistic<WithdrawJoinVars, unknown>(queryClient, {
      invalidate: (vars) => [queryKeys.myJoinRequests, queryKeys.tournament(vars.tournamentId)],
    }),
  });
}
