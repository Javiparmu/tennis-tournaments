import type { SurfaceType } from "@courtrank/core";

// JS-side color tokens for props that don't take NativeWind classes (icon colors,
// gradient stops, chart strokes). Class-based styling uses the Tailwind tokens in
// tailwind.config.js; these mirror them. Keep the two in sync.
//
// Mobile is dark-first and does NOT mirror the web app's light chrome. There is one
// theme, so no component carries a light/dark branch.
export const colors = {
  // Canvas → surface → surface2 is the elevation ladder. On near-black a shadow is
  // invisible, so depth is lightness plus a hairline `line` border — never a shadow.
  canvas: "#0b0f0c",
  surface: "#1c231e",
  surface2: "#28312a",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.14)",
  // Not pure white: #fff on near-black haloes on OLED.
  ink: "#f5f7f3",
  inkMuted: "#9ba49c",
  inkFaint: "#6b7570",
  // The app's one loud colour.
  lime: "#d7ff3e",
  limeDim: "#c6f24e",
  // Semantic tones, picked for a dark canvas: the light-theme values (rose-600
  // #e11d48, blue-600 #2563eb) go muddy and unreadable here.
  danger: "#fb7185",
  live: "#fbbf24",
  info: "#60a5fa",
} as const;

// The old court green (#0b6b3a) is gone rather than demoted: once the night bands
// went, nothing referenced it — on this canvas it reads as near-black. Surfaces that
// must agree with web read SURFACE_HEX from @courtrank/core directly.

// SURFACE_HEX is tuned for white backgrounds and shared with web, so it cannot
// change — but HARD (#2563eb) as a 4px strip on #0b0f0c is nearly invisible, and
// CLAY/GRASS both dull out. These are the same hues lifted in lightness/saturation
// to carry on the dark canvas. Card accents and SurfaceBadge dots read from here;
// anything that must agree with web reads SURFACE_HEX.
export const surfaceOnDark: Record<SurfaceType, string> = {
  CLAY: "#f0805f",
  HARD: "#5b9dff",
  GRASS: "#3fce6b",
};

export const surfaceOnDarkFallback = "#8b968f";

export function surfaceColor(surface?: string | null): string {
  const key = surface ? (surface.toUpperCase() as SurfaceType) : undefined;
  return (key && surfaceOnDark[key]) || surfaceOnDarkFallback;
}
