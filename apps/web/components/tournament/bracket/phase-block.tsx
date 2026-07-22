import type { BracketPhase, Match } from "@courtrank/core/models";
import { GroupPhase } from "./group-phase";
import { KnockoutTree } from "./knockout-tree";
import { PHASE_FORMAT_LABEL } from "./labels";
import type { MatchSelectionState } from "./match-card";
import { SwissPhase } from "./swiss-phase";

export function PhaseBlock({
  phase,
  onSelectMatch,
  getMatchSelectionState,
}: {
  phase: BracketPhase;
  onSelectMatch?: (match: Match) => void;
  getMatchSelectionState?: (match: Match) => MatchSelectionState;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-court/10 font-display text-sm font-black text-court">
          {phase.phaseOrder}
        </span>
        <h3 className="font-display text-lg font-bold text-court-ink">Fase {PHASE_FORMAT_LABEL[phase.format]}</h3>
      </div>

      {phase.format === "KNOCKOUT" ? (
        <KnockoutTree phase={phase} onSelectMatch={onSelectMatch} getMatchSelectionState={getMatchSelectionState} />
      ) : phase.format === "GROUP" ? (
        <GroupPhase phase={phase} onSelectMatch={onSelectMatch} getMatchSelectionState={getMatchSelectionState} />
      ) : (
        <SwissPhase phase={phase} onSelectMatch={onSelectMatch} getMatchSelectionState={getMatchSelectionState} />
      )}
    </div>
  );
}
