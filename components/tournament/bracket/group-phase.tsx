import type { BracketPhase, Match } from "@/models";
import { computeStandings } from "@/lib/standings";
import { MatchCard } from "./match-card";
import { StandingsTable } from "./standings-table";

// GROUP phase: matches carry a groupId; bucket them into per-group cards, each
// with a mini standings table plus that group's fixtures.
export function GroupPhase({
  phase,
  onSelectMatch,
}: {
  phase: BracketPhase;
  onSelectMatch?: (match: Match) => void;
}) {
  const matches = (phase.rounds ?? []).flatMap((r) => r.matches ?? []);

  const groups = new Map<number | null, Match[]>();
  for (const match of matches) {
    const key = match.groupId;
    const bucket = groups.get(key);
    if (bucket) bucket.push(match);
    else groups.set(key, [match]);
  }

  const ordered = [...groups.entries()].sort(([a], [b]) => (a ?? 0) - (b ?? 0));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {ordered.map(([groupId, groupMatches], index) => (
        <div key={groupId ?? "none"} className="rounded-2xl border border-court/10 bg-white p-4 shadow-sm">
          <h4 className="mb-3 font-display text-sm font-bold text-court-ink">
            {groupId != null ? `Grupo ${String.fromCharCode(65 + index)}` : "Partidos"}
          </h4>
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
