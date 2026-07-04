import { CalendarDays, Dumbbell, Medal, Target, Trophy } from "lucide-react";

export function StatsCard({
  totalEvents,
  scheduledMatches,
  playedMatches,
  trainings,
  racketsCount,
  isOwner,
}: {
  totalEvents: number;
  scheduledMatches: number;
  playedMatches: number;
  trainings: number;
  racketsCount: number;
  isOwner: boolean;
}) {
  const tiles = [
    { icon: CalendarDays, value: totalEvents, label: "Eventos en vista" },
    { icon: Target, value: scheduledMatches, label: "Programados / en juego" },
    { icon: Trophy, value: playedMatches, label: "Jugados" },
    { icon: Dumbbell, value: trainings, label: "Entrenamientos" },
    { icon: Medal, value: racketsCount, label: isOwner ? "Tus raquetas" : "Raquetas públicas" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-center backdrop-blur-md"
        >
          <tile.icon className="mx-auto h-4 w-4 text-ball-bright" />
          <p className="mt-1 font-display text-2xl font-black text-white">{tile.value}</p>
          <p className="text-[11px] text-white/70">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
