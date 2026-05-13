import type { Tournament } from "@/models";
import { request } from "./client";

export async function getTournaments(): Promise<Tournament[]> {
  return request<Tournament[]>("/tournaments");
}

export async function getUpcomingCalendar(limit = 4): Promise<Tournament[]> {
  const tournaments = await getTournaments();
  return tournaments
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, limit);
}
