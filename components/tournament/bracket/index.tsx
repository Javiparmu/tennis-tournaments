import type { Match, TournamentBracket } from "@/models";
import { PhaseBlock } from "./phase-block";

export function Bracket({
  bracket,
  onSelectMatch,
}: {
  bracket: TournamentBracket;
  onSelectMatch?: (match: Match) => void;
}) {
  const phases = bracket.phases ?? [];
  if (phases.length === 0 || phases.every((p) => (p.rounds ?? []).length === 0)) {
    return (
      <p className="rounded-2xl border border-dashed border-court/20 bg-white p-8 text-center text-sm text-zinc-500">
        Aún no se han generado partidos. El cuadro aparece cuando empieza el torneo.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {phases.map((phase) => (
        <PhaseBlock key={phase.id} phase={phase} onSelectMatch={onSelectMatch} />
      ))}
    </div>
  );
}
