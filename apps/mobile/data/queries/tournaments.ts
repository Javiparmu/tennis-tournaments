import {
  type CreateTournamentJoinRequest,
  createJoinRequest,
  getMyJoinRequests,
  getMyTournaments,
  getTournament,
  getTournamentBracket,
  getTournamentMatches,
  getTournamentPhases,
  getTournamentPlayers,
  getTournaments,
  getUpcomingCalendar,
  joinTournamentByCode,
  optimistic,
  queryKeys,
  type JoinTournamentByCodeRequest,
  type Tournament,
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
  // Optionally authed: pass the token so PRIVATE tournaments (reached from the
  // Ligas tab) authorize, while public deep-links still load when signed out.
  const { getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.tournament(id),
    queryFn: async () => getTournament(await getToken(), id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentPhasesQuery(id?: number) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.tournamentPhases(id),
    queryFn: async () => getTournamentPhases(await getToken(), id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentPlayersQuery(id?: number) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.tournamentPlayers(id),
    queryFn: async () => getTournamentPlayers(await getToken(), id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentMatchesQuery(id?: number) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.tournamentMatches(id),
    queryFn: async () => getTournamentMatches(await getToken(), id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useTournamentBracketQuery(id?: number) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.tournamentBracket(id),
    queryFn: async () => getTournamentBracket(await getToken(), id as number),
    enabled: id != null,
    staleTime: 30_000,
  });
}

export function useMyTournamentsQuery() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: queryKeys.myTournaments,
    queryFn: async () => getMyTournaments(await getToken()),
    enabled: isLoaded && isSignedIn,
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

export function useJoinTournamentByCodeMutation() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (payload: JoinTournamentByCodeRequest) => joinTournamentByCode(await getToken(), payload),
    ...optimistic<JoinTournamentByCodeRequest, Tournament>(queryClient, {
      invalidate: () => [queryKeys.myTournaments, queryKeys.tournaments],
    }),
  });
}
