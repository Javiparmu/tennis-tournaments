"use client";

import { useMeQuery } from "./users";
import type { TournamentBasic } from "@courtrank/core/models";

// True when the signed-in user owns or administers the given club — gates the
// host management controls. Comes from /users/me (managedClubIds); the backend
// still authorizes every mutation server-side.
export function useCanManageClub(clubId?: number): boolean {
  const me = useMeQuery();
  if (clubId == null) return false;
  return (me.data?.managedClubIds ?? []).includes(clubId);
}

export function useCanManageTournament(tournament?: Pick<TournamentBasic, "clubId" | "ownerUserId"> | null): boolean {
  const me = useMeQuery();
  if (!tournament || !me.data) return false;
  if (tournament.ownerUserId != null) return tournament.ownerUserId === me.data.id;
  if (tournament.clubId == null) return false;
  return (me.data.managedClubIds ?? []).includes(tournament.clubId);
}
