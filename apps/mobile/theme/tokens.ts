import { SURFACE_HEX } from "@courtrank/core";

// JS-side color tokens for props that don't take NativeWind classes (icon colors,
// gradient stops, chart strokes). Class-based styling uses the Tailwind tokens in
// tailwind.config.js; these mirror them.
export const colors = {
  ink: "#0a0a0a",
  inkSoft: "#161615",
  paper: "#faf9f7",
  paperMuted: "#9ca3af",
  clay: "#d8694c",
  hard: "#2563eb",
  grass: "#16a34a",
  border: "rgba(250,249,247,0.12)",
  surface: SURFACE_HEX,
} as const;

// Dark hero gradient stops, mirroring the web PageHero chrome.
export const heroGradient = ["#161615", "#0a0a0a"] as const;
