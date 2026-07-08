"use client";

import { motion, useReducedMotion } from "motion/react";

// Top-down doubles court at real proportions (23.77m × 10.97m, ×50).
// [path, stagger step] — outer boundary draws first, then inner structure.
const LINES: Array<[string, number]> = [
  ["M4 4 H1185 V545 H4 Z", 0], // doubles boundary
  ["M4 72.5 H1185", 1], // singles sideline (top)
  ["M4 476.5 H1185", 1], // singles sideline (bottom)
  ["M274.5 72.5 V476.5", 2], // service line (left)
  ["M914.5 72.5 V476.5", 2], // service line (right)
  ["M274.5 274.5 H914.5", 3], // center service line
  ["M594.5 4 V545", 3], // net line
  ["M4 274.5 H274.5", 4], // midline, left edge to the service line (no overlap with center line)
  ["M1185 274.5 H914.5", 4], // midline, right edge to the service line
];

// Chalk court lines. Decorative only — the caller controls color/opacity via
// currentColor. Static by default; only the landing hero passes `animate` so the
// draw-in is a single signature moment rather than firing on every dark band.
export function CourtLinesSvg({
  className,
  animate = false,
  // Stroke is in viewBox units; `slice` upscales it, so a big full-bleed band
  // (the landing hero) needs a smaller value to look as thin as the compact
  // contained bands elsewhere.
  strokeWidth = 4,
}: {
  className?: string;
  animate?: boolean;
  strokeWidth?: number;
}) {
  const reduced = useReducedMotion();
  const draw = animate && !reduced;

  return (
    <svg viewBox="0 0 1189 549" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className}>
      {LINES.map(([d, step]) =>
        draw ? (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            // opacity stays 0 until each line's delay, then snaps on as it starts
            // drawing — otherwise the round cap shows a floating dot before the draw.
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.9, ease: "easeInOut", delay: step * 0.15 },
              opacity: { duration: 0.01, delay: step * 0.15 },
            }}
          />
        ) : (
          <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        ),
      )}
    </svg>
  );
}
