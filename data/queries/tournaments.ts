"use client";

import { useQuery } from "@tanstack/react-query";
import { getTournaments, getUpcomingCalendar } from "@/data/api/tournaments";
import { queryKeys } from "./keys";

export function useTournamentsQuery() {
  return useQuery({
    queryKey: queryKeys.tournaments,
    queryFn: getTournaments,
    staleTime: 30_000,
  });
}

export function useUpcomingCalendarQuery(limit = 4) {
  return useQuery({
    queryKey: queryKeys.upcomingCalendar(limit),
    queryFn: () => getUpcomingCalendar(limit),
    staleTime: 30_000,
  });
}
