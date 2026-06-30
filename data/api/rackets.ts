import type {
  CreateRacketRequest,
  CreateRacketStringingRequest,
  RacketDetails,
  RacketStringingHistoryEntry,
  RacketSummary,
  UpdateRacketRequest,
  UpdateRacketStringingRequest,
} from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getPublicRackets(userId: number): Promise<RacketSummary[]> {
  return request<RacketSummary[]>(`/users/${userId}/rackets`);
}

export async function getMyRackets(token: string | null | undefined): Promise<RacketSummary[]> {
  return request<RacketSummary[]>("/users/me/rackets", buildRequestInit(undefined, requireToken(token)));
}

export async function getPublicRacketDetails(userId: number, racketId: number): Promise<RacketDetails> {
  return request<RacketDetails>(`/users/${userId}/rackets/${racketId}`);
}

export async function getMyRacketDetails(
  token: string | null | undefined,
  racketId: number,
): Promise<RacketDetails> {
  return request<RacketDetails>(
    `/users/me/rackets/${racketId}`,
    buildRequestInit(undefined, requireToken(token)),
  );
}

export async function createRacket(
  token: string | null | undefined,
  payload: CreateRacketRequest,
): Promise<RacketSummary> {
  return request<RacketSummary>(
    "/users/me/rackets",
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function updateRacket(
  token: string | null | undefined,
  racketId: number,
  payload: UpdateRacketRequest,
): Promise<RacketSummary> {
  return request<RacketSummary>(
    `/users/me/rackets/${racketId}`,
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function deleteRacket(token: string | null | undefined, racketId: number): Promise<void> {
  return request<void>(
    `/users/me/rackets/${racketId}`,
    buildRequestInit({ method: "DELETE" }, requireToken(token)),
  );
}

export async function createStringing(
  token: string | null | undefined,
  racketId: number,
  payload: CreateRacketStringingRequest,
): Promise<RacketStringingHistoryEntry> {
  return request<RacketStringingHistoryEntry>(
    `/users/me/rackets/${racketId}/stringings`,
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function updateStringing(
  token: string | null | undefined,
  racketId: number,
  stringingId: number,
  payload: UpdateRacketStringingRequest,
): Promise<RacketStringingHistoryEntry> {
  return request<RacketStringingHistoryEntry>(
    `/users/me/rackets/${racketId}/stringings/${stringingId}`,
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function deleteStringing(
  token: string | null | undefined,
  racketId: number,
  stringingId: number,
): Promise<void> {
  return request<void>(
    `/users/me/rackets/${racketId}/stringings/${stringingId}`,
    buildRequestInit({ method: "DELETE" }, requireToken(token)),
  );
}
