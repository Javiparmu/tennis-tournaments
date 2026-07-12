// Surface → Tailwind style mapping, reused across the timeline, grid, and the
// tournaments page so clay/hard/grass read the same everywhere. The canonical
// label + hex live in @courtrank/core; this layer adds the web (Tailwind) classes.

import { SURFACE_FALLBACK, SURFACE_HEX, SURFACE_LABEL } from "@courtrank/core/lib/surface";
import type { SurfaceType } from "@courtrank/core/models/tournament";

// Re-exported so existing `@/lib/surface` consumers keep importing the label here.
export { SURFACE_LABEL } from "@courtrank/core/lib/surface";

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

const CLASSES: Record<SurfaceType, { text: string; bg: string; border: string }> = {
  CLAY: { text: "text-clay", bg: "bg-clay/10", border: "border-clay/30" },
  HARD: { text: "text-hard", bg: "bg-hard/10", border: "border-hard/30" },
  GRASS: { text: "text-grass", bg: "bg-grass/10", border: "border-grass/30" },
};

const FALLBACK: SurfaceStyle = {
  label: SURFACE_FALLBACK.label,
  text: "text-stone-500",
  bg: "bg-stone-100",
  border: "border-stone-200",
  hex: SURFACE_FALLBACK.hex,
};

export function surfaceStyle(surface: string | null | undefined): SurfaceStyle {
  if (!surface) return FALLBACK;
  const key = surface.toUpperCase() as SurfaceType;
  const classes = CLASSES[key];
  if (!classes) return FALLBACK;
  return { label: SURFACE_LABEL[key], ...classes, hex: SURFACE_HEX[key] };
}
