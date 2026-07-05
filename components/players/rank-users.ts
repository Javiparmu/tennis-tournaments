import type { User } from "@/models";

// Ranks players for the leaderboard by Elo-style rating (desc). Ties break on
// match wins (desc), then username (alphabetical) so the order is always stable.
// Ratings and wins default to 1000 / 0 to tolerate an older backend. Returns a
// new array — never mutates the input.
export function rankUsers(users: User[]): User[] {
  return [...users].sort((a, b) => {
    const byRating = (b.rating ?? 1000) - (a.rating ?? 1000);
    if (byRating !== 0) return byRating;
    const byWins = (b.matchWins ?? 0) - (a.matchWins ?? 0);
    if (byWins !== 0) return byWins;
    return a.username.localeCompare(b.username);
  });
}
