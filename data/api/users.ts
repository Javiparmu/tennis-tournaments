import type { ProfileCalendarResponse, User, UserMatchActivityResponse } from "@/models";
import { buildRequestInit, request, requireToken } from "./client";

export async function getUser(userId: number): Promise<User> {
  return request<User>(`/users/${userId}`);
}

export async function getMe(token: string | null | undefined): Promise<User> {
  return request<User>("/users/me", buildRequestInit(undefined, requireToken(token)));
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
