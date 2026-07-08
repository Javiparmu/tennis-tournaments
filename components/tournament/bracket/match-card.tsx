import { Chip } from "@heroui/react";
import { formatScore } from "@/lib/score";
import type { Match } from "@/models";
import { MATCH_STATUS_LABEL, statusColor } from "./labels";

function PlayerRow({ match, side }: { match: Match; side: 1 | 2 }) {
  const player = side === 1 ? match.player1 : match.player2;
  const isWinner = player != null && match.winnerId === player.id;
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-1.5 ${
        isWinner ? "font-semibold text-court-ink" : "text-stone-600"
      }`}
    >
      <span className="flex items-center gap-1.5 truncate">
        {isWinner && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-court" />}
        {player?.name ?? <span className="text-stone-400">Por definir</span>}
      </span>
      {player?.seed != null && (
        <span className="shrink-0 rounded bg-stone-100 px-1 text-[10px] font-medium text-stone-500">{player.seed}</span>
      )}
    </div>
  );
}

export function MatchCard({ match, onSelect }: { match: Match; onSelect?: (match: Match) => void }) {
  const isLive = match.status === "LIVE";
  const inner = (
    <>
      <div className="divide-y divide-court/5">
        <PlayerRow match={match} side={1} />
        <PlayerRow match={match} side={2} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-court/10 bg-court/5 px-3 py-1.5">
        <span className="font-mono text-xs text-stone-600">{formatScore(match.score, match.status)}</span>
        <Chip size="sm" variant="soft" color={statusColor(match.status)}>
          {MATCH_STATUS_LABEL[match.status]}
        </Chip>
      </div>
    </>
  );

  const base = `block w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm ${
    isLive ? "border-warning/40 ring-2 ring-warning/30" : "border-court/10"
  }`;

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(match)}
        className={`${base} cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court`}
      >
        {inner}
      </button>
    );
  }
  return <div className={base}>{inner}</div>;
}
