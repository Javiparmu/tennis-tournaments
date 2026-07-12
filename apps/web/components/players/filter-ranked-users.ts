import { normalizeSearch } from "@courtrank/core/lib/search";
import type { User } from "@courtrank/core/models";

export type RankedRow = { user: User; position: number };

// Attaches each user's 1-based leaderboard position (from the already-ranked
// order) and keeps only rows whose display name or username matches the query.
// Position reflects the *true* rank, so a search hit shows where the player
// actually sits on the board — not a renumbered 1..N of the filtered subset.
// An empty/whitespace query returns every row. Never mutates the input.
export function filterRankedUsers(ranked: User[], query: string): RankedRow[] {
  const rows = ranked.map((user, index) => ({ user, position: index + 1 }));
  const q = normalizeSearch(query);
  if (!q) return rows;
  return rows.filter(({ user }) => {
    const name = normalizeSearch(user.name ?? "");
    const username = normalizeSearch(user.username);
    return name.includes(q) || username.includes(q);
  });
}
