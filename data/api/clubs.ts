import type {
  Club,
  ClubContactRequest,
  ClubContactRequestPayload,
  CreateClubRequest,
  PublicUser,
  UpdateClubRequest,
} from "@/models";
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

// Clubs are provisioned manually: they ask to join through this public contact
// request, and the platform admin reviews the queue and creates the club from /admin.
export async function sendClubContactRequest(payload: ClubContactRequestPayload): Promise<void> {
  await request("/club-contact-requests", { method: "POST", body: JSON.stringify(payload) });
}

export async function getClubContactRequests(token: string | null | undefined): Promise<ClubContactRequest[]> {
  return request<ClubContactRequest[]>(
    "/club-contact-requests",
    buildRequestInit(undefined, requireToken(token)),
  );
}

export async function deleteClubContactRequest(token: string | null | undefined, id: number): Promise<void> {
  return request<void>(
    `/club-contact-requests/${id}`,
    buildRequestInit({ method: "DELETE" }, requireToken(token)),
  );
}

// Platform admin only: creates the club on behalf of its owner user.
export async function createClub(token: string | null | undefined, payload: CreateClubRequest): Promise<Club> {
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
