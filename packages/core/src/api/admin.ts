import type { AdminClubContactRequest, AdminClubSummary, AdminOverview, Club, CreateClubRequest } from "../models";
import { apiDelete, apiGet, apiPost, requireToken } from "./client";

export async function getAdminOverview(token: string | null | undefined): Promise<AdminOverview> {
  return apiGet<AdminOverview>("/admin/overview", requireToken(token));
}

export async function getAdminClubContactRequests(
  token: string | null | undefined,
): Promise<AdminClubContactRequest[]> {
  return apiGet<AdminClubContactRequest[]>("/admin/club-contact-requests", requireToken(token));
}

export async function deleteAdminClubContactRequest(token: string | null | undefined, id: number): Promise<void> {
  return apiDelete<void>(`/admin/club-contact-requests/${id}`, requireToken(token));
}

export async function getAdminClubs(token: string | null | undefined): Promise<AdminClubSummary[]> {
  return apiGet<AdminClubSummary[]>("/admin/clubs", requireToken(token));
}

export async function createAdminClub(token: string | null | undefined, payload: CreateClubRequest): Promise<Club> {
  return apiPost<Club>("/admin/clubs", payload, requireToken(token));
}
