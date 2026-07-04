import type {
  AcceptTournamentJoinRequest,
  AddPlayersRequest,
  CreatePhaseRequest,
  CreateTournamentJoinRequest,
  CreateTournamentRequest,
  DecideTournamentJoinRequest,
  Match,
  Player,
  Tournament,
  TournamentBasic,
  TournamentBracket,
  TournamentJoinRequest,
  TournamentJoinRequestStatus,
  TournamentPhase,
  TournamentPhaseSummary,
  UpdateTournamentRequest,
} from "@/models";
import { apiDelete, apiGet, apiPost, apiPut, requireToken } from "./client";

export async function getTournaments(): Promise<TournamentBasic[]> {
  return apiGet<TournamentBasic[]>("/tournaments");
}

export async function getUpcomingCalendar(limit = 4): Promise<TournamentBasic[]> {
  const tournaments = await getTournaments();
  return tournaments.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)).slice(0, limit);
}

export async function getTournament(id: number): Promise<Tournament> {
  return apiGet<Tournament>(`/tournaments/${id}`);
}

export async function createTournament(
  token: string | null | undefined,
  payload: CreateTournamentRequest,
): Promise<Tournament> {
  return apiPost<Tournament>("/tournaments", payload, requireToken(token));
}

export async function updateTournament(
  token: string | null | undefined,
  payload: UpdateTournamentRequest,
): Promise<Tournament> {
  return apiPut<Tournament>("/tournaments", payload, requireToken(token));
}

export async function deleteTournament(token: string | null | undefined, id: number): Promise<void> {
  return apiDelete<void>(`/tournaments/${id}`, requireToken(token));
}

export async function startTournament(token: string | null | undefined, id: number): Promise<Tournament> {
  return apiPost<Tournament>(`/tournaments/${id}/start`, undefined, requireToken(token));
}

export async function resetTournament(token: string | null | undefined, id: number): Promise<Tournament> {
  return apiPost<Tournament>(`/tournaments/${id}/reset`, undefined, requireToken(token));
}

export async function getTournamentPhases(id: number): Promise<TournamentPhaseSummary[]> {
  return apiGet<TournamentPhaseSummary[]>(`/tournaments/${id}/phases`);
}

export async function createPhase(
  token: string | null | undefined,
  id: number,
  payload: CreatePhaseRequest,
): Promise<TournamentPhase> {
  return apiPost<TournamentPhase>(`/tournaments/${id}/phases`, payload, requireToken(token));
}

export async function getTournamentPlayers(id: number): Promise<Player[]> {
  return apiGet<Player[]>(`/tournaments/${id}/players`);
}

export async function addTournamentPlayers(
  token: string | null | undefined,
  id: number,
  payload: AddPlayersRequest,
): Promise<Tournament> {
  return apiPost<Tournament>(`/tournaments/${id}/players`, payload, requireToken(token));
}

export async function removeTournamentPlayer(
  token: string | null | undefined,
  id: number,
  playerId: number,
): Promise<void> {
  return apiDelete<void>(`/tournaments/${id}/players/${playerId}`, requireToken(token));
}

export async function getTournamentMatches(id: number): Promise<Match[]> {
  return apiGet<Match[]>(`/tournaments/${id}/matches`);
}

export async function getTournamentBracket(id: number): Promise<TournamentBracket> {
  return apiGet<TournamentBracket>(`/tournaments/${id}/bracket`);
}

export async function getMyJoinRequests(token: string | null | undefined): Promise<TournamentJoinRequest[]> {
  return apiGet<TournamentJoinRequest[]>("/users/me/tournament-join-requests", requireToken(token));
}

export async function createJoinRequest(
  token: string | null | undefined,
  id: number,
  payload: CreateTournamentJoinRequest,
): Promise<TournamentJoinRequest> {
  return apiPost<TournamentJoinRequest>(`/tournaments/${id}/join-requests`, payload, requireToken(token));
}

export async function withdrawJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
): Promise<TournamentJoinRequest> {
  return apiPost<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/withdraw`,
    undefined,
    requireToken(token),
  );
}

export async function getTournamentJoinRequests(
  token: string | null | undefined,
  id: number,
  status?: TournamentJoinRequestStatus,
): Promise<TournamentJoinRequest[]> {
  const query = status ? `?status=${status}` : "";
  return apiGet<TournamentJoinRequest[]>(`/tournaments/${id}/join-requests${query}`, requireToken(token));
}

export async function acceptJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
  payload: AcceptTournamentJoinRequest,
): Promise<TournamentJoinRequest> {
  return apiPost<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/accept`,
    payload,
    requireToken(token),
  );
}

export async function rejectJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
  payload: DecideTournamentJoinRequest,
): Promise<TournamentJoinRequest> {
  return apiPost<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/reject`,
    payload,
    requireToken(token),
  );
}

export async function allowResubmitJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
): Promise<TournamentJoinRequest> {
  return apiPost<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/allow-resubmit`,
    undefined,
    requireToken(token),
  );
}
