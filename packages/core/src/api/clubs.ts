import type {
  Club,
  ClubContactRequest,
  ClubContactRequestPayload,
  CreateClubRequest,
  PublicUser,
  UpdateClubRequest,
} from "../models";
import { apiDelete, apiGet, apiPost, apiPut, requireToken } from "./client";

export async function getClubs(): Promise<Club[]> {
  return apiGet<Club[]>("/clubs");
}

export async function getClub(id: number): Promise<Club> {
  return apiGet<Club>(`/clubs/${id}`);
}

export async function getClubAdmins(id: number): Promise<PublicUser[]> {
  return apiGet<PublicUser[]>(`/clubs/${id}/admins`);
}

// Clubs are provisioned manually: they ask to join through this public contact
// request, and the platform admin reviews the queue and creates the club from /admin.
export async function sendClubContactRequest(payload: ClubContactRequestPayload): Promise<void> {
  await apiPost("/club-contact-requests", payload);
}

export async function getClubContactRequests(token: string | null | undefined): Promise<ClubContactRequest[]> {
  return apiGet<ClubContactRequest[]>("/club-contact-requests", requireToken(token));
}

export async function deleteClubContactRequest(token: string | null | undefined, id: number): Promise<void> {
  return apiDelete<void>(`/club-contact-requests/${id}`, requireToken(token));
}

// Platform admin only: creates the club on behalf of its owner user.
export async function createClub(token: string | null | undefined, payload: CreateClubRequest): Promise<Club> {
  return apiPost<Club>("/clubs", payload, requireToken(token));
}

export async function updateClub(token: string | null | undefined, payload: UpdateClubRequest): Promise<Club> {
  return apiPut<Club>("/clubs", payload, requireToken(token));
}

export async function addClubAdmin(token: string | null | undefined, clubId: number, userId: number): Promise<void> {
  return apiPost<void>(`/clubs/${clubId}/admins/${userId}`, undefined, requireToken(token));
}

export async function removeClubAdmin(token: string | null | undefined, clubId: number, userId: number): Promise<void> {
  return apiDelete<void>(`/clubs/${clubId}/admins/${userId}`, requireToken(token));
}
