import type { CreatePlayerRequest, Player, UpdatePlayerRequest } from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getPlayers(): Promise<Player[]> {
  return request<Player[]>("/players");
}

export async function getPlayer(id: number): Promise<Player> {
  return request<Player>(`/players/${id}`);
}

export async function createPlayer(
  token: string | null | undefined,
  payload: CreatePlayerRequest,
): Promise<Player> {
  return request<Player>(
    "/players",
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function updatePlayer(
  token: string | null | undefined,
  payload: UpdatePlayerRequest,
): Promise<Player> {
  return request<Player>(
    "/players",
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function deletePlayer(token: string | null | undefined, id: number): Promise<void> {
  return request<void>(`/players/${id}`, buildRequestInit({ method: "DELETE" }, requireToken(token)));
}
