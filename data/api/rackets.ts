import type { RacketSummary } from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getPublicRackets(userId: number): Promise<RacketSummary[]> {
  return request<RacketSummary[]>(`/users/${userId}/rackets`);
}

export async function getMyRackets(token: string | null | undefined): Promise<RacketSummary[]> {
  return request<RacketSummary[]>("/users/me/rackets", buildRequestInit(undefined, requireToken(token)));
}
