import { computeStandings } from "@courtrank/core/lib/standings";
import type { BracketPhase, Match } from "@courtrank/core/models";
import type { MatchSelectionState } from "./match-card";
import { MatchCard } from "./match-card";
import { StandingsTable } from "./standings-table";

// SWISS phase: round-by-round fixtures alongside a running standings panel.
export function SwissPhase({
  phase,
  onSelectMatch,
  getMatchSelectionState,
}: {
  phase: BracketPhase;
  onSelectMatch?: (match: Match) => void;
  getMatchSelectionState?: (match: Match) => MatchSelectionState;
}) {
  const rounds = [...(phase.rounds ?? [])].sort((a, b) => a.round - b.round);
  const matches = rounds.flatMap((r) => r.matches ?? []);

  return (
    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        {rounds.map((round) => (
          <div key={round.round}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">Ronda {round.round}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(round.matches ?? []).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={onSelectMatch}
                  selectionState={getMatchSelectionState?.(match)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-court/10 bg-white p-4 shadow-sm">
        <h4 className="mb-3 font-display text-sm font-bold text-court-ink">Clasificación</h4>
        <StandingsTable rows={computeStandings([], matches)} />
      </div>
    </div>
  );
}
