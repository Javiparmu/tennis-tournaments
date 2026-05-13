import type { CreateTrainingRequest, UpdateTrainingRequest, UserTrainingEntry, UserTrainingRangeResponse } from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getPublicTrainings(userId: number, from: string, to: string): Promise<UserTrainingRangeResponse> {
  const query = new URLSearchParams({ from, to }).toString();
  return request<UserTrainingRangeResponse>(`/users/${userId}/trainings?${query}`);
}

export async function getMyTrainings(
  token: string | null | undefined,
  from: string,
  to: string,
): Promise<UserTrainingRangeResponse> {
  const query = new URLSearchParams({ from, to }).toString();
  return request<UserTrainingRangeResponse>(
    `/users/me/trainings?${query}`,
    buildRequestInit(undefined, requireToken(token)),
  );
}

export async function createTraining(
  token: string | null | undefined,
  payload: CreateTrainingRequest,
): Promise<UserTrainingEntry> {
  return request<UserTrainingEntry>(
    "/users/me/trainings",
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function updateTraining(
  token: string | null | undefined,
  trainingId: number,
  payload: UpdateTrainingRequest,
): Promise<UserTrainingEntry> {
  return request<UserTrainingEntry>(
    `/users/me/trainings/${trainingId}`,
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function deleteTraining(token: string | null | undefined, trainingId: number): Promise<void> {
  return request<void>(
    `/users/me/trainings/${trainingId}`,
    buildRequestInit({ method: "DELETE" }, requireToken(token)),
  );
}
