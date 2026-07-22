import type {
  AcceptTournamentJoinRequest,
  AddPlayersRequest,
  CreatePhaseRequest,
  CreateTournamentJoinRequest,
  CreateTournamentRequest,
  JoinTournamentByCodeRequest,
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
} from "../models";
import { apiDelete, apiGet, apiPost, apiPut, requireToken } from "./client";

export async function getTournaments(): Promise<TournamentBasic[]> {
  return apiGet<TournamentBasic[]>("/tournaments");
}

// One day of grace keeps tournaments starting "Hoy" in the feed regardless of
// the viewer's time of day.
const UPCOMING_GRACE_MS = 86_400_000;

// A tournament that already finished (or died) is never "próximo", even if its
// start date is within the grace window.
const ENDED_STATUSES = new Set(["COMPLETED", "CANCELLED", "ABANDONED"]);

/** Pure: keeps future-dated, still-alive tournaments, sorts soonest-first, truncates. */
export function upcomingCalendar(
  tournaments: TournamentBasic[],
  limit: number,
  now: number = Date.now(),
): TournamentBasic[] {
  return tournaments
    .filter((t) => !ENDED_STATUSES.has(t.status) && +new Date(t.startDate) >= now - UPCOMING_GRACE_MS)
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, limit);
}

export async function getUpcomingCalendar(limit = 4): Promise<TournamentBasic[]> {
  // TODO(backend): add ?limit=/?from= to the tournaments endpoint and drop this client-side filter.
  return upcomingCalendar(await getTournaments(), limit);
}

// Optionally authed: public tournaments load anonymously, but PRIVATE ones need
// the viewer's token so the backend authorizes access. Pass the token when the
// viewer is signed in; omit it for anonymous public views.
export async function getTournament(token: string | null | undefined, id: number): Promise<Tournament> {
  return apiGet<Tournament>(`/tournaments/${id}`, token ?? undefined);
}

export async function getMyTournaments(token: string | null | undefined): Promise<TournamentBasic[]> {
  return apiGet<TournamentBasic[]>("/users/me/tournaments", requireToken(token));
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

export async function joinTournamentByCode(
  token: string | null | undefined,
  payload: JoinTournamentByCodeRequest,
): Promise<Tournament> {
  return apiPost<Tournament>("/tournaments/join", payload, requireToken(token));
}

export async function startTournament(token: string | null | undefined, id: number): Promise<Tournament> {
  return apiPost<Tournament>(`/tournaments/${id}/start`, undefined, requireToken(token));
}

export async function resetTournament(token: string | null | undefined, id: number): Promise<Tournament> {
  return apiPost<Tournament>(`/tournaments/${id}/reset`, undefined, requireToken(token));
}

// Optionally authed like getTournament: PRIVATE tournaments only expose their
// phases to the viewer's token; public tournaments load anonymously.
export async function getTournamentPhases(
  token: string | null | undefined,
  id: number,
): Promise<TournamentPhaseSummary[]> {
  return apiGet<TournamentPhaseSummary[]>(`/tournaments/${id}/phases`, token ?? undefined);
}

export async function createPhase(
  token: string | null | undefined,
  id: number,
  payload: CreatePhaseRequest,
): Promise<TournamentPhase> {
  return apiPost<TournamentPhase>(`/tournaments/${id}/phases`, payload, requireToken(token));
}

export async function getTournamentPlayers(token: string | null | undefined, id: number): Promise<Player[]> {
  return apiGet<Player[]>(`/tournaments/${id}/players`, token ?? undefined);
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

export async function getTournamentMatches(token: string | null | undefined, id: number): Promise<Match[]> {
  return apiGet<Match[]>(`/tournaments/${id}/matches`, token ?? undefined);
}

export async function getTournamentBracket(
  token: string | null | undefined,
  id: number,
): Promise<TournamentBracket> {
  return apiGet<TournamentBracket>(`/tournaments/${id}/bracket`, token ?? undefined);
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
