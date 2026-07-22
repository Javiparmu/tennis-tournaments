import type {
  AddLeagueMemberRequest,
  CreateLeagueRequest,
  JoinLeagueRequest,
  League,
  LeagueMatch,
  LeagueMember,
  RecordLeagueMatchRequest,
  UpdateLeagueRequest,
} from "../models";
import { apiDelete, apiGet, apiPost, apiPut, requireToken } from "./client";

export async function getMyLeagues(token: string | null | undefined): Promise<League[]> {
  return apiGet<League[]>("/users/me/leagues", requireToken(token));
}

export async function getLeague(token: string | null | undefined, id: number): Promise<League> {
  return apiGet<League>(`/leagues/${id}`, requireToken(token));
}

export async function createLeague(token: string | null | undefined, payload: CreateLeagueRequest): Promise<League> {
  return apiPost<League>("/leagues", payload, requireToken(token));
}

export async function updateLeague(token: string | null | undefined, payload: UpdateLeagueRequest): Promise<League> {
  return apiPut<League>(`/leagues/${payload.id}`, payload, requireToken(token));
}

export async function deleteLeague(token: string | null | undefined, id: number): Promise<void> {
  return apiDelete<void>(`/leagues/${id}`, requireToken(token));
}

export async function joinLeagueByCode(token: string | null | undefined, payload: JoinLeagueRequest): Promise<League> {
  return apiPost<League>("/leagues/join", payload, requireToken(token));
}

export async function addLeagueMember(
  token: string | null | undefined,
  id: number,
  payload: AddLeagueMemberRequest,
): Promise<LeagueMember> {
  return apiPost<LeagueMember>(`/leagues/${id}/members`, payload, requireToken(token));
}

export async function removeLeagueMember(
  token: string | null | undefined,
  id: number,
  playerId: number,
): Promise<void> {
  return apiDelete<void>(`/leagues/${id}/members/${playerId}`, requireToken(token));
}

export async function getLeagueMembers(token: string | null | undefined, id: number): Promise<LeagueMember[]> {
  return apiGet<LeagueMember[]>(`/leagues/${id}/members`, requireToken(token));
}

export async function getLeagueMatches(token: string | null | undefined, id: number): Promise<LeagueMatch[]> {
  return apiGet<LeagueMatch[]>(`/leagues/${id}/matches`, requireToken(token));
}

export async function recordLeagueMatch(
  token: string | null | undefined,
  id: number,
  payload: RecordLeagueMatchRequest,
): Promise<LeagueMatch> {
  return apiPost<LeagueMatch>(`/leagues/${id}/matches`, payload, requireToken(token));
}

export async function deleteLeagueMatch(
  token: string | null | undefined,
  id: number,
  matchId: number,
): Promise<void> {
  return apiDelete<void>(`/leagues/${id}/matches/${matchId}`, requireToken(token));
}

export async function regenerateLeagueInviteCode(token: string | null | undefined, id: number): Promise<League> {
  return apiPost<League>(`/leagues/${id}/invite-code`, undefined, requireToken(token));
}
