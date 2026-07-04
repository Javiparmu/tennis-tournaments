import { computeStandings } from "@/lib/standings";
import type { BracketPhase, Match } from "@/models";
import { MatchCard } from "./match-card";
import { StandingsTable } from "./standings-table";

// GROUP phase: matches carry a groupId; bucket them into per-group cards, each
// with a mini standings table plus that group's fixtures.
export function GroupPhase({ phase, onSelectMatch }: { phase: BracketPhase; onSelectMatch?: (match: Match) => void }) {
  const matches = (phase.rounds ?? []).flatMap((r) => r.matches ?? []);

  const groups = new Map<number | null, Match[]>();
  for (const match of matches) {
    const key = match.groupId;
    const bucket = groups.get(key);
    if (bucket) bucket.push(match);
    else groups.set(key, [match]);
  }

  // Letter the real groups from the sorted distinct group ids only, so the
  // ungrouped (null) bucket never consumes "A". Fall back to a number past Z.
  const groupIds = [...groups.keys()].filter((id): id is number => id != null).sort((a, b) => a - b);
  const ordered: Array<{ key: string; label: string; matches: Match[] }> = groupIds.map((id, index) => ({
    key: `group-${id}`,
    label: index < 26 ? `Grupo ${String.fromCharCode(65 + index)}` : `Grupo ${index + 1}`,
    matches: groups.get(id) ?? [],
  }));

  // Render the ungrouped bucket last so it never shifts the real group letters.
  const ungrouped = groups.get(null);
  if (ungrouped && ungrouped.length > 0) {
    ordered.push({ key: "ungrouped", label: "Partidos", matches: ungrouped });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {ordered.map(({ key, label, matches: groupMatches }) => (
        <div key={key} className="rounded-2xl border border-court/10 bg-white p-4 shadow-sm">
          <h4 className="mb-3 font-display text-sm font-bold text-court-ink">{label}</h4>
          <StandingsTable rows={computeStandings([], groupMatches)} />
          <div className="mt-4 grid gap-3">
            {groupMatches.map((match) => (
              <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
