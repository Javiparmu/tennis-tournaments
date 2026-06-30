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
import { buildRequestInit, request, requireToken } from "./client";

export async function getTournaments(): Promise<TournamentBasic[]> {
  return request<TournamentBasic[]>("/tournaments");
}

export async function getUpcomingCalendar(limit = 4): Promise<TournamentBasic[]> {
  const tournaments = await getTournaments();
  return tournaments.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)).slice(0, limit);
}

export async function getTournament(id: number): Promise<Tournament> {
  return request<Tournament>(`/tournaments/${id}`);
}

export async function createTournament(
  token: string | null | undefined,
  payload: CreateTournamentRequest,
): Promise<Tournament> {
  return request<Tournament>(
    "/tournaments",
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function updateTournament(
  token: string | null | undefined,
  payload: UpdateTournamentRequest,
): Promise<Tournament> {
  return request<Tournament>(
    "/tournaments",
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function deleteTournament(token: string | null | undefined, id: number): Promise<void> {
  return request<void>(`/tournaments/${id}`, buildRequestInit({ method: "DELETE" }, requireToken(token)));
}

export async function startTournament(token: string | null | undefined, id: number): Promise<Tournament> {
  return request<Tournament>(`/tournaments/${id}/start`, buildRequestInit({ method: "POST" }, requireToken(token)));
}

export async function resetTournament(token: string | null | undefined, id: number): Promise<Tournament> {
  return request<Tournament>(`/tournaments/${id}/reset`, buildRequestInit({ method: "POST" }, requireToken(token)));
}

export async function getTournamentPhases(id: number): Promise<TournamentPhaseSummary[]> {
  return request<TournamentPhaseSummary[]>(`/tournaments/${id}/phases`);
}

export async function createPhase(
  token: string | null | undefined,
  id: number,
  payload: CreatePhaseRequest,
): Promise<TournamentPhase> {
  return request<TournamentPhase>(
    `/tournaments/${id}/phases`,
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function getTournamentPlayers(id: number): Promise<Player[]> {
  return request<Player[]>(`/tournaments/${id}/players`);
}

export async function addTournamentPlayers(
  token: string | null | undefined,
  id: number,
  payload: AddPlayersRequest,
): Promise<Tournament> {
  return request<Tournament>(
    `/tournaments/${id}/players`,
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function removeTournamentPlayer(
  token: string | null | undefined,
  id: number,
  playerId: number,
): Promise<void> {
  return request<void>(
    `/tournaments/${id}/players/${playerId}`,
    buildRequestInit({ method: "DELETE" }, requireToken(token)),
  );
}

export async function getTournamentMatches(id: number): Promise<Match[]> {
  return request<Match[]>(`/tournaments/${id}/matches`);
}

export async function getTournamentBracket(id: number): Promise<TournamentBracket> {
  return request<TournamentBracket>(`/tournaments/${id}/bracket`);
}

export async function getMyJoinRequests(token: string | null | undefined): Promise<TournamentJoinRequest[]> {
  return request<TournamentJoinRequest[]>(
    "/users/me/tournament-join-requests",
    buildRequestInit(undefined, requireToken(token)),
  );
}

export async function createJoinRequest(
  token: string | null | undefined,
  id: number,
  payload: CreateTournamentJoinRequest,
): Promise<TournamentJoinRequest> {
  return request<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests`,
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function withdrawJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
): Promise<TournamentJoinRequest> {
  return request<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/withdraw`,
    buildRequestInit({ method: "POST" }, requireToken(token)),
  );
}

export async function getTournamentJoinRequests(
  token: string | null | undefined,
  id: number,
  status?: TournamentJoinRequestStatus,
): Promise<TournamentJoinRequest[]> {
  const query = status ? `?status=${status}` : "";
  return request<TournamentJoinRequest[]>(
    `/tournaments/${id}/join-requests${query}`,
    buildRequestInit(undefined, requireToken(token)),
  );
}

export async function acceptJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
  payload: AcceptTournamentJoinRequest,
): Promise<TournamentJoinRequest> {
  return request<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/accept`,
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function rejectJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
  payload: DecideTournamentJoinRequest,
): Promise<TournamentJoinRequest> {
  return request<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/reject`,
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function allowResubmitJoinRequest(
  token: string | null | undefined,
  id: number,
  requestId: number,
): Promise<TournamentJoinRequest> {
  return request<TournamentJoinRequest>(
    `/tournaments/${id}/join-requests/${requestId}/allow-resubmit`,
    buildRequestInit({ method: "POST" }, requireToken(token)),
  );
}
