import type { Match, UpdateMatchScoreRequest } from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getMatch(id: number): Promise<Match> {
  return request<Match>(`/matches/${id}`);
}

export async function updateMatchScore(
  token: string | null | undefined,
  id: number,
  payload: UpdateMatchScoreRequest,
): Promise<Match> {
  return request<Match>(
    `/matches/${id}/score`,
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, requireToken(token)),
  );
}
