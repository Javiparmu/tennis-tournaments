import type { CreatePlayerRequest, Player, UpdatePlayerRequest } from "../models";
import { apiDelete, apiGet, apiPost, apiPut, requireToken } from "./client";

export async function getPlayers(): Promise<Player[]> {
  return apiGet<Player[]>("/players");
}

export async function getPlayer(id: number): Promise<Player> {
  return apiGet<Player>(`/players/${id}`);
}

export async function createPlayer(token: string | null | undefined, payload: CreatePlayerRequest): Promise<Player> {
  return apiPost<Player>("/players", payload, requireToken(token));
}

export async function updatePlayer(token: string | null | undefined, payload: UpdatePlayerRequest): Promise<Player> {
  return apiPut<Player>("/players", payload, requireToken(token));
}

export async function deletePlayer(token: string | null | undefined, id: number): Promise<void> {
  return apiDelete<void>(`/players/${id}`, requireToken(token));
}
