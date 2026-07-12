// Canonical surface data shared across platforms: the Spanish label and the raw
// accent hex for clay/hard/grass. Framework styling (Tailwind classes on web,
// NativeWind on mobile) is layered on top of this per app — see each app's own
// surface helper.
import type { SurfaceType } from "../models/tournament";

export const SURFACE_LABEL: Record<SurfaceType, string> = {
  CLAY: "Tierra batida",
  HARD: "Pista dura",
  GRASS: "Hierba",
};

export const SURFACE_HEX: Record<SurfaceType, string> = {
  CLAY: "#d8694c",
  HARD: "#2563eb",
  GRASS: "#16a34a",
};

export const SURFACE_FALLBACK = {
  label: "Por definir",
  hex: "#78716c",
} as const;
