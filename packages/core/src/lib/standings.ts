import type { Match, Player } from "../models";

// A player's live standing derived from bracket matches.
export type PlayerStatus = "champion" | "in" | "out" | "pending";

export type PlayerStanding = {
  player: Player;
  wins: number;
  losses: number;
  status: PlayerStatus;
};

// Rank champion first, then those still in, pending, and eliminated last;
// break ties by wins so the strongest performers surface at the top.
export const STANDING_ORDER: Record<PlayerStatus, number> = { champion: 0, in: 1, pending: 2, out: 3 };

// Build per-player win/loss records and in/out status from a set of matches.
// Enrolled `players` carry no progress once a tournament starts, so we also
// fold in every player that appears in a match (covers bracket-only entries).
// Pass `championPlayerId` to flag the tournament winner; omit it for scoped
// tallies (e.g. a single group) where there is no overall champion yet.
export function computeStandings(
  players: Player[],
  matches: Match[],
  championPlayerId: number | null = null,
): PlayerStanding[] {
  const byId = new Map<number, Player>();
  for (const player of players) byId.set(player.id, player);
  for (const match of matches) {
    for (const player of [match.player1, match.player2]) {
      if (player && !byId.has(player.id)) byId.set(player.id, player);
    }
  }

  const wins = new Map<number, number>();
  const losses = new Map<number, number>();
  const hasUpcoming = new Set<number>();

  for (const match of matches) {
    const ids = [match.player1?.id, match.player2?.id].filter((x): x is number => x != null);
    if (match.status === "COMPLETED" || match.status === "WALKOVER") {
      if (match.winnerId != null) {
        wins.set(match.winnerId, (wins.get(match.winnerId) ?? 0) + 1);
        for (const pid of ids) {
          if (pid !== match.winnerId) losses.set(pid, (losses.get(pid) ?? 0) + 1);
        }
      }
    } else if (match.status === "SCHEDULED" || match.status === "LIVE") {
      for (const pid of ids) hasUpcoming.add(pid);
    }
  }

  return [...byId.values()]
    .map((player) => {
      const w = wins.get(player.id) ?? 0;
      const l = losses.get(player.id) ?? 0;
      let status: PlayerStatus;
      if (championPlayerId === player.id) status = "champion";
      else if (hasUpcoming.has(player.id)) status = "in";
      else if (l > 0) status = "out";
      else status = "pending";
      return { player, wins: w, losses: l, status };
    })
    .sort((a, b) => STANDING_ORDER[a.status] - STANDING_ORDER[b.status] || b.wins - a.wins);
}
