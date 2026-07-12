import type { Match, UpdateMatchScoreRequest } from "../models";
import { apiGet, apiPut, requireToken } from "./client";

export async function getMatch(id: number): Promise<Match> {
  return apiGet<Match>(`/matches/${id}`);
}

export async function updateMatchScore(
  token: string | null | undefined,
  id: number,
  payload: UpdateMatchScoreRequest,
): Promise<Match> {
  return apiPut<Match>(`/matches/${id}/score`, payload, requireToken(token));
}
