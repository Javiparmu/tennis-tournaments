import { Chip } from "@heroui/react";
import type { BracketPhase, Match, TournamentBracket } from "@/models";
import { formatScore } from "@/lib/score";

function statusColor(status: Match["status"]) {
  if (status === "LIVE" || status === "WALKOVER") return "warning" as const;
  if (status === "COMPLETED") return "success" as const;
  return "default" as const;
}

const MATCH_STATUS_LABEL: Record<Match["status"], string> = {
  SCHEDULED: "Programado",
  LIVE: "En juego",
  COMPLETED: "Finalizado",
  WALKOVER: "W.O.",
};

const PHASE_FORMAT_LABEL: Record<BracketPhase["format"], string> = {
  KNOCKOUT: "Eliminatoria",
  GROUP: "Grupos",
  SWISS: "Suizo",
};

function PlayerRow({ match, side }: { match: Match; side: 1 | 2 }) {
  const player = side === 1 ? match.player1 : match.player2;
  const isWinner = player != null && match.winnerId === player.id;
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-1.5 ${
        isWinner ? "font-semibold text-court-ink" : "text-zinc-600"
      }`}
    >
      <span className="flex items-center gap-1.5 truncate">
        {isWinner && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-court" />}
        {player?.name ?? <span className="text-zinc-400">Por definir</span>}
      </span>
      {player?.seed != null && <span className="text-[10px] text-zinc-400">#{player.seed}</span>}
    </div>
  );
}

function MatchCard({ match, onSelect }: { match: Match; onSelect?: (match: Match) => void }) {
  const inner = (
    <>
      <div className="divide-y divide-court/5">
        <PlayerRow match={match} side={1} />
        <PlayerRow match={match} side={2} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-court/10 bg-court/5 px-3 py-1.5">
        <span className="font-mono text-xs text-zinc-600">{formatScore(match.score, match.status)}</span>
        <Chip size="sm" variant="soft" color={statusColor(match.status)}>
          {MATCH_STATUS_LABEL[match.status]}
        </Chip>
      </div>
    </>
  );

  const base = "block w-full overflow-hidden rounded-xl border border-court/10 bg-white text-left shadow-sm";
  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(match)} className={`${base} transition-shadow hover:shadow-md`}>
        {inner}
      </button>
    );
  }
  return <div className={base}>{inner}</div>;
}

function PhaseBlock({ phase, onSelectMatch }: { phase: BracketPhase; onSelectMatch?: (match: Match) => void }) {
  const isKnockout = phase.format === "KNOCKOUT";
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-court/10 font-display text-sm font-black text-court">
          {phase.phaseOrder}
        </span>
        <h3 className="font-display text-lg font-bold text-court-ink">
          Fase {PHASE_FORMAT_LABEL[phase.format]}
        </h3>
      </div>

      <div className={isKnockout ? "flex gap-5 overflow-x-auto pb-2" : "space-y-5"}>
        {(phase.rounds ?? []).map((round) => (
          <div
            key={round.round}
            className={isKnockout ? "flex w-60 shrink-0 flex-col gap-3" : ""}
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Ronda {round.round}</p>
            <div className={isKnockout ? "flex flex-col justify-around gap-3" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
              {(round.matches ?? []).map((match) => (
                <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
