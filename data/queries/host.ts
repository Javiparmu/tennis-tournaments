"use client";

import { useClubAdminsQuery, useClubQuery } from "./clubs";
import { useMeQuery } from "./users";

// True when the signed-in user owns or administers the given club — gates the
// host management controls. Backend still authorizes every mutation server-side.
export function useCanManageClub(clubId?: number): boolean {
  const me = useMeQuery();
  const club = useClubQuery(clubId);
  const admins = useClubAdminsQuery(clubId);

  const meId = me.data?.id;
  if (meId == null || clubId == null) return false;
  if (club.data?.user.id === meId) return true;
  return (admins.data ?? []).some((admin) => admin.id === meId);
}
