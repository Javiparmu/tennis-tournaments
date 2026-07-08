// Surface → color mapping, reused across the timeline, grid, and (later) the
// tournaments page so clay/hard/grass read the same everywhere.

import type { SurfaceType } from "@/models/tournament";

type SurfaceStyle = {
  label: string;
  /** Tailwind text color token. */
  text: string;
  /** Tailwind background tint for soft chips. */
  bg: string;
  /** Tailwind border token. */
  border: string;
  /** Raw hex, for inline accents (left bars, dots). */
  hex: string;
};

const STYLES: Record<SurfaceType, SurfaceStyle> = {
  CLAY: { label: "Tierra batida", text: "text-clay", bg: "bg-clay/10", border: "border-clay/30", hex: "#d8694c" },
  HARD: { label: "Pista dura", text: "text-hard", bg: "bg-hard/10", border: "border-hard/30", hex: "#2563eb" },
  GRASS: { label: "Hierba", text: "text-grass", bg: "bg-grass/10", border: "border-grass/30", hex: "#16a34a" },
};

const FALLBACK: SurfaceStyle = {
  label: "Por definir",
  text: "text-stone-500",
  bg: "bg-stone-100",
  border: "border-stone-200",
  hex: "#78716c",
};

// Canonical surface labels (clay/hard/grass), shared with forms and calendars.
export const SURFACE_LABEL: Record<SurfaceType, string> = {
  CLAY: STYLES.CLAY.label,
  HARD: STYLES.HARD.label,
  GRASS: STYLES.GRASS.label,
};

export function surfaceStyle(surface: string | null | undefined): SurfaceStyle {
  if (!surface) return FALLBACK;
  return STYLES[surface.toUpperCase() as SurfaceType] ?? FALLBACK;
}
