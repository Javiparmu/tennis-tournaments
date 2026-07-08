import { normalizeSearch } from "@/lib/search";
import type { TournamentBasic } from "@/models";

// Filters the public tournament list by name + description, case- and
// accent-insensitive. An empty/whitespace query returns the list unchanged
// (same reference), so the common no-search path stays allocation-free. Generic
// so it only depends on the two fields it reads — never mutates the input.
export function filterTournaments<T extends Pick<TournamentBasic, "name" | "description">>(
  tournaments: T[],
  query: string,
): T[] {
  const q = normalizeSearch(query);
  if (!q) return tournaments;
  return tournaments.filter((tournament) => {
    const name = normalizeSearch(tournament.name);
    const description = normalizeSearch(tournament.description ?? "");
    return name.includes(q) || description.includes(q);
  });
}
