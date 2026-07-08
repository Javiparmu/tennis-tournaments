import { motion } from "motion/react";
import type { Match } from "@/models";
import type { NodeRect } from "./use-node-positions";

// Draws the bracket edges from the explicit dependency graph. Each match points
// at the matches that feed it via `matchDependencies.requiredMatchId`, so we can
// render exact connectors (byes, non-power-of-2 draws and 3rd-place playoffs all
// just work) instead of guessing from column indices. Edges whose feeder match
// has a decided winner are highlighted; unresolved feeders stay faint.
export function Connectors({
  matches,
  rects,
  animate,
}: {
  matches: Match[];
  rects: Map<number, NodeRect>;
  animate: boolean;
}) {
  const byId = new Map(matches.map((m) => [m.id, m]));

  const edges: { key: string; d: string; highlight: boolean; delay: number }[] = [];
  for (const parent of matches) {
    const p = rects.get(parent.id);
    if (!p) continue;
    for (const dep of parent.matchDependencies ?? []) {
      const c = rects.get(dep.requiredMatchId);
      if (!c) continue;
      const startX = c.right;
      const startY = c.midY;
      const endX = p.left;
      const endY = p.midY;
      const midX = startX + (endX - startX) / 2;
      const child = byId.get(dep.requiredMatchId);
      const highlight =
        child != null && child.winnerId != null && (child.status === "COMPLETED" || child.status === "WALKOVER");
      edges.push({
        key: `${dep.requiredMatchId}->${parent.id}`,
        d: `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`,
        highlight,
        delay: animate ? Math.max(0, parent.round - 1) * 0.12 : 0,
      });
    }
  }

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
      <title>Conexiones del cuadro</title>
      {edges.map((e) => (
        <motion.path
          key={e.key}
          d={e.d}
          stroke="var(--color-court)"
          strokeWidth={e.highlight ? 2.5 : 2}
          strokeOpacity={e.highlight ? 0.9 : 0.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: e.delay, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
