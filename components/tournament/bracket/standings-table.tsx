import type { PlayerStanding } from "@/lib/standings";

// Compact standings grid shared by GROUP and SWISS phases. PJ = played, G/P = won/lost.
export function StandingsTable({ rows }: { rows: PlayerStanding[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-court/15 px-3 py-4 text-center text-xs text-zinc-400">
        Sin jugadores todavía.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-court/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-court/5 text-[11px] uppercase tracking-wide text-zinc-500">
            <th className="px-3 py-1.5 text-left font-semibold">Jugador</th>
            <th className="w-10 px-1 py-1.5 text-center font-semibold">PJ</th>
            <th className="w-10 px-1 py-1.5 text-center font-semibold">G</th>
            <th className="w-10 px-1 py-1.5 text-center font-semibold">P</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-court/5">
          {rows.map(({ player, wins, losses }, i) => (
            <tr key={player.id} className={i === 0 ? "bg-ball/10" : undefined}>
              <td className="truncate px-3 py-1.5 text-court-ink">
                <span className="mr-1.5 text-xs text-zinc-400">{i + 1}</span>
                {player.name}
              </td>
              <td className="px-1 py-1.5 text-center font-mono text-zinc-500">{wins + losses}</td>
              <td className="px-1 py-1.5 text-center font-mono font-semibold text-court">{wins}</td>
              <td className="px-1 py-1.5 text-center font-mono text-zinc-500">{losses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
