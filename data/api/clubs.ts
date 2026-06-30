import type { Club, CreateClubRequest, PublicUser, UpdateClubRequest } from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getClubs(): Promise<Club[]> {
  return request<Club[]>("/clubs");
}

export async function getClub(id: number): Promise<Club> {
  return request<Club>(`/clubs/${id}`);
}

export async function getClubAdmins(id: number): Promise<PublicUser[]> {
  return request<PublicUser[]>(`/clubs/${id}/admins`);
}

export async function createClub(
  token: string | null | undefined,
  payload: CreateClubRequest,
): Promise<Club> {
  return request<Club>(
    "/clubs",
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function updateClub(
  token: string | null | undefined,
  payload: UpdateClubRequest,
): Promise<Club> {
  return request<Club>(
    "/clubs",
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function deleteClub(token: string | null | undefined, id: number): Promise<void> {
  return request<void>(`/clubs/${id}`, buildRequestInit({ method: "DELETE" }, requireToken(token)));
}

export async function addClubAdmin(
  token: string | null | undefined,
  clubId: number,
  userId: number,
): Promise<void> {
  return request<void>(
    `/clubs/${clubId}/admins/${userId}`,
    buildRequestInit({ method: "POST" }, requireToken(token)),
  );
}

export async function removeClubAdmin(
  token: string | null | undefined,
  clubId: number,
  userId: number,
): Promise<void> {
  return request<void>(
    `/clubs/${clubId}/admins/${userId}`,
    buildRequestInit({ method: "DELETE" }, requireToken(token)),
  );
}
