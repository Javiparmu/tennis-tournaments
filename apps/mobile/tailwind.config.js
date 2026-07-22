/** @type {import('tailwindcss').Config} */
// Mirrors apps/mobile/theme/tokens.ts — the JS tokens serve props that cannot take
// classes (icon colours, SVG strokes, gradient stops). Change both together.
//
// Mobile is dark-first with a single theme: there is no `dark:` variant in this app,
// and no component carries a light/dark branch.
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Elevation ladder: canvas → surface → surface-2, plus a hairline border.
        // Shadows are invisible on near-black, so depth is lightness, never shadow.
        canvas: "#0b0f0c",
        surface: {
          DEFAULT: "#1c231e",
          2: "#28312a",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        // Not pure white: #fff on near-black haloes on OLED.
        ink: {
          DEFAULT: "#f5f7f3",
          muted: "#9ba49c",
          faint: "#6b7570",
        },
        // The app's one loud colour.
        lime: {
          DEFAULT: "#d7ff3e",
          dim: "#c6f24e",
        },
        // Semantic tones picked for a dark canvas — light-theme rose-600/blue-600
        // go muddy here.
        danger: "#fb7185",
        live: "#fbbf24",
        info: "#60a5fa",
      },
      // RN cannot synthesize weights for custom fonts: pairing `font-sans` with
      // `font-bold` silently falls back to the system font on Android. Every
      // weight therefore gets its own family utility.
      fontFamily: {
        display: ["Archivo_800ExtraBold"],
        "display-black": ["Archivo_900Black"],
        "display-bold": ["Archivo_700Bold"],
        sans: ["Geist_400Regular"],
        "sans-medium": ["Geist_500Medium"],
        "sans-semibold": ["Geist_600SemiBold"],
        "sans-bold": ["Geist_700Bold"],
        mono: ["GeistMono_400Regular"],
        "mono-medium": ["GeistMono_500Medium"],
        "mono-bold": ["GeistMono_700Bold"],
      },
    },
  },
  plugins: [],
};
