import { Dumbbell, Target, Trophy, Zap } from "lucide-react";

// Compact stat strip for the Resumen dashboard (light surface). The rating headline
// lives in the profile header, so it is intentionally not repeated here.
export function StatsCard({
  scheduledMatches,
  playedMatches,
  trainings,
  racketsCount,
  isOwner,
}: {
  scheduledMatches: number;
  playedMatches: number;
  trainings: number;
  racketsCount: number;
  isOwner: boolean;
}) {
  const tiles = [
    { icon: Zap, value: scheduledMatches, label: "Programados" },
    { icon: Trophy, value: playedMatches, label: "Jugados" },
    { icon: Dumbbell, value: trainings, label: "Entrenos" },
    { icon: Target, value: racketsCount, label: isOwner ? "Raquetas" : "Raquetas públicas" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex items-center gap-3 rounded-2xl border border-court/10 bg-white p-3 shadow-sm"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-court/5">
            <tile.icon className="h-4 w-4 text-court" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-black leading-none text-court-ink tabular-nums">{tile.value}</p>
            <p className="truncate text-[11px] text-stone-500">{tile.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
