import { Medal } from "lucide-react";
import { DataCard } from "@/components/data-card";
import { EmptyState } from "@/components/empty-state";

type Achievement = { id: number; name: string; description: string | null };

// Achievements as a first-class dashboard card (previously buried as inline chips
// in the hero summary). Lives in the Resumen bento so medals are a headline
// feature, not an afterthought.
export function AchievementsCard({ achievements }: { achievements: Achievement[] }) {
  return (
    <DataCard title="Logros" icon={Medal}>
      {achievements.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <span
              key={achievement.id}
              title={achievement.description ?? achievement.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-court/15 bg-court/5 px-3 py-1 text-xs font-medium text-court-ink"
            >
              <Medal className="h-3 w-3 text-court" aria-hidden />
              {achievement.name}
            </span>
          ))}
        </div>
      ) : (
        <EmptyState
          size="compact"
          icon={Medal}
          title="Sin logros todavía"
          description="Juega partidos y registra entrenamientos para desbloquear tus primeras insignias."
        />
      )}
    </DataCard>
  );
}
