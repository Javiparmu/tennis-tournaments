import type {
  CreateTrainingRequest,
  UpdateTrainingRequest,
  UserTrainingEntry,
  UserTrainingRangeResponse,
} from "@/models";
import { apiDelete, apiGet, apiPost, apiPut, requireToken } from "./client";

export async function getPublicTrainings(userId: number, from: string, to: string): Promise<UserTrainingRangeResponse> {
  const query = new URLSearchParams({ from, to }).toString();
  return apiGet<UserTrainingRangeResponse>(`/users/${userId}/trainings?${query}`);
}

export async function getMyTrainings(
  token: string | null | undefined,
  from: string,
  to: string,
): Promise<UserTrainingRangeResponse> {
  const query = new URLSearchParams({ from, to }).toString();
  return apiGet<UserTrainingRangeResponse>(`/users/me/trainings?${query}`, requireToken(token));
}

export async function createTraining(
  token: string | null | undefined,
  payload: CreateTrainingRequest,
): Promise<UserTrainingEntry> {
  return apiPost<UserTrainingEntry>("/users/me/trainings", payload, requireToken(token));
}

export async function updateTraining(
  token: string | null | undefined,
  trainingId: number,
  payload: UpdateTrainingRequest,
): Promise<UserTrainingEntry> {
  return apiPut<UserTrainingEntry>(`/users/me/trainings/${trainingId}`, payload, requireToken(token));
}

export async function deleteTraining(token: string | null | undefined, trainingId: number): Promise<void> {
  return apiDelete<void>(`/users/me/trainings/${trainingId}`, requireToken(token));
}
