import type { ProfileCalendarResponse, TournamentBasic, UpdateUserRequest, User, UserMatchActivityResponse } from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

// Tournaments this user is registered in. Backend filters to the player's accepted
// registrations; the carousel narrows to upcoming ones client-side.
export async function getUserTournaments(userId: number): Promise<TournamentBasic[]> {
  return request<TournamentBasic[]>(`/users/${userId}/tournaments`);
}

export async function getUser(userId: number): Promise<User> {
  return request<User>(`/users/${userId}`);
}

export async function getUserByUsername(username: string): Promise<User> {
  return request<User>(`/users/by-username/${encodeURIComponent(username)}`);
}

export async function getMe(token: string | null | undefined): Promise<User> {
  return request<User>("/users/me", buildRequestInit(undefined, requireToken(token)));
}

export async function updateMe(token: string | null | undefined, payload: UpdateUserRequest): Promise<User> {
  return request<User>(
    "/users/me",
    buildRequestInit({ method: "PATCH", body: JSON.stringify(payload) }, requireToken(token)),
  );
}

export async function getUserMatchActivity(
  userId: number,
  from: string,
  to: string,
): Promise<UserMatchActivityResponse> {
  const query = new URLSearchParams({ from, to }).toString();
  return request<UserMatchActivityResponse>(`/users/${userId}/matches?${query}`);
}

export async function getUserProfileCalendar(
  userId: number,
  from: string,
  to: string,
  timezone: string,
): Promise<ProfileCalendarResponse> {
  const query = new URLSearchParams({ from, to, timezone }).toString();
  return request<ProfileCalendarResponse>(`/users/${userId}/profile-calendar?${query}`);
}

export async function getMyProfileCalendar(
  token: string | null | undefined,
  from: string,
  to: string,
  timezone: string,
): Promise<ProfileCalendarResponse> {
  const query = new URLSearchParams({ from, to, timezone }).toString();
  return request<ProfileCalendarResponse>(
    `/users/me/profile-calendar?${query}`,
    buildRequestInit(undefined, requireToken(token)),
  );
}
