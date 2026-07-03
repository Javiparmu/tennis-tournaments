"use client";

import { useMeQuery } from "./users";

// True when the signed-in user owns or administers the given club — gates the
// host management controls. Comes from /users/me (managedClubIds); the backend
// still authorizes every mutation server-side.
export function useCanManageClub(clubId?: number): boolean {
  const me = useMeQuery();
  if (clubId == null) return false;
  return (me.data?.managedClubIds ?? []).includes(clubId);
}
