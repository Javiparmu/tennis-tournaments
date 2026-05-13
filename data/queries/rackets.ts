"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMyRackets, getPublicRackets } from "@/data/api/rackets";
import { queryKeys } from "./keys";

export function usePublicRacketsQuery(userId?: number) {
  return useQuery({
    queryKey: queryKeys.publicRackets(userId),
    queryFn: () => getPublicRackets(userId as number),
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useMyRacketsQuery(enabled = true) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.myRackets,
    queryFn: async () => getMyRackets(await getToken()),
    enabled: enabled && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
}
