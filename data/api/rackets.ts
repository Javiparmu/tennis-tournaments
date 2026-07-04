import type {
  CreateRacketRequest,
  CreateRacketStringingRequest,
  RacketDetails,
  RacketStringingHistoryEntry,
  RacketSummary,
  UpdateRacketRequest,
  UpdateRacketStringingRequest,
} from "@/models";
import { apiDelete, apiGet, apiPost, apiPut, requireToken } from "./client";

export async function getPublicRackets(userId: number): Promise<RacketSummary[]> {
  return apiGet<RacketSummary[]>(`/users/${userId}/rackets`);
}

export async function getMyRackets(token: string | null | undefined): Promise<RacketSummary[]> {
  return apiGet<RacketSummary[]>("/users/me/rackets", requireToken(token));
}

export async function getPublicRacketDetails(userId: number, racketId: number): Promise<RacketDetails> {
  return apiGet<RacketDetails>(`/users/${userId}/rackets/${racketId}`);
}

export async function getMyRacketDetails(token: string | null | undefined, racketId: number): Promise<RacketDetails> {
  return apiGet<RacketDetails>(`/users/me/rackets/${racketId}`, requireToken(token));
}

export async function createRacket(
  token: string | null | undefined,
  payload: CreateRacketRequest,
): Promise<RacketSummary> {
  return apiPost<RacketSummary>("/users/me/rackets", payload, requireToken(token));
}

export async function updateRacket(
  token: string | null | undefined,
  racketId: number,
  payload: UpdateRacketRequest,
): Promise<RacketSummary> {
  return apiPut<RacketSummary>(`/users/me/rackets/${racketId}`, payload, requireToken(token));
}

export async function deleteRacket(token: string | null | undefined, racketId: number): Promise<void> {
  return apiDelete<void>(`/users/me/rackets/${racketId}`, requireToken(token));
}

export async function createStringing(
  token: string | null | undefined,
  racketId: number,
  payload: CreateRacketStringingRequest,
): Promise<RacketStringingHistoryEntry> {
  return apiPost<RacketStringingHistoryEntry>(`/users/me/rackets/${racketId}/stringings`, payload, requireToken(token));
}

export async function updateStringing(
  token: string | null | undefined,
  racketId: number,
  stringingId: number,
  payload: UpdateRacketStringingRequest,
): Promise<RacketStringingHistoryEntry> {
  return apiPut<RacketStringingHistoryEntry>(
    `/users/me/rackets/${racketId}/stringings/${stringingId}`,
    payload,
    requireToken(token),
  );
}

export async function deleteStringing(
  token: string | null | undefined,
  racketId: number,
  stringingId: number,
): Promise<void> {
  return apiDelete<void>(`/users/me/rackets/${racketId}/stringings/${stringingId}`, requireToken(token));
}
